// File: contracts/MarketplaceEscrow.sol
// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

interface IERC721Minimal {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address _from, address _to, uint256 _id) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function getApproved(uint256 tokenId) external view returns (address);
}

/// @title MarketplaceEscrow - marketplace with escrow, platform fee and EIP-2981 royalty payouts
contract MarketplaceEscrow is ReentrancyGuard, Ownable, Pausable {
    address public nftAddress;

    // marketplace fee in basis points (bps). 100 bps = 1%
    uint256 public platformFeeBps; // e.g., 250 = 2.5%
    address payable public feeRecipient;

    // Listings
    struct Listing {
        address payable seller;
        uint256 price; // wei
        bool active;
    }
    mapping(uint256 => Listing) public listings;

    // escrow / deposit tracking for earnest deposits
    mapping(uint256 => uint256) public escrowDeposits; // tokenId => wei deposited (by buyer)
    mapping(uint256 => address) public buyer; // tokenId => buyer (depositor)
    mapping(uint256 => uint256) public purchaseAmount; // mirrors listing price
    mapping(uint256 => address payable) public sellerOf; // mirrors listing seller

    // listing enumeration for frontend
    uint256[] private listedIds;
    mapping(uint256 => uint256) private indexInListed; // tokenId => index+1

    // Events
    event Listed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event ListingUpdated(uint256 indexed tokenId, uint256 newPrice);
    event EarnestDeposited(uint256 indexed tokenId, address indexed buyer, uint256 amount);
    event Finalized(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price);
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event DirectPurchased(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price, uint256 fee, uint256 royalty);
    event PlatformFeeChanged(uint256 newFeeBps);
    event FeeRecipientChanged(address newRecipient);
    event NFTAddressUpdated(address newAddress);
    event RoyaltyPaid(uint256 indexed tokenId, address indexed recipient, uint256 amount);
    event Refund(uint256 indexed tokenId, address indexed to, uint256 amount);

    // New events for off-chain indexing (replace on-chain arrays)
    event NFTPurchased(address indexed buyer, uint256 indexed tokenId, uint256 price);
    event NFTSold(address indexed seller, uint256 indexed tokenId, uint256 price);

    // modifiers
    modifier onlySeller(uint256 tokenId) {
        require(listings[tokenId].seller == msg.sender, "only seller");
        _;
    }
    modifier onlyBuyer(uint256 tokenId) {
        require(buyer[tokenId] == msg.sender, "only buyer");
        _;
    }

    constructor(address _nftAddress, address payable _feeRecipient, uint256 _platformFeeBps) {
        require(_nftAddress != address(0), "invalid nft");
        require(_feeRecipient != address(0), "invalid fee recipient");
        require(_platformFeeBps <= 1000, "fee too high"); // default guard (<=10%)
        nftAddress = _nftAddress;
        feeRecipient = _feeRecipient;
        platformFeeBps = _platformFeeBps;
    }

    // -------------------------
    // Admin / owner functions
    // -------------------------
    function setPlatformFeeBps(uint256 _bps) external onlyOwner {
        require(_bps <= 2000, "Bps too high"); // safety cap (<=20%)
        platformFeeBps = _bps;
        emit PlatformFeeChanged(_bps);
    }

    function setFeeRecipient(address payable _recipient) external onlyOwner {
        require(_recipient != address(0), "zero address");
        feeRecipient = _recipient;
        emit FeeRecipientChanged(_recipient);
    }

    /// @notice withdraw stuck fees only if any (should be rarely needed as fees are forwarded immediately)
    function withdrawStuck(address payable _to, uint256 _amount) external onlyOwner nonReentrant {
        require(_to != address(0), "zero address");
        (bool sent, ) = _to.call{value: _amount}("");
        require(sent, "withdraw failed");
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function updateNFTAddress(address _new) external onlyOwner {
        require(_new != address(0), "zero address");
        nftAddress = _new;
        emit NFTAddressUpdated(_new);
    }

    // -------------------------
    // Listing helpers
    // -------------------------
    function _addToListed(uint256 _tokenId) internal {
        indexInListed[_tokenId] = listedIds.length + 1;
        listedIds.push(_tokenId);
    }

    function _removeFromListed(uint256 _tokenId) internal {
        uint256 idxPlusOne = indexInListed[_tokenId];
        if (idxPlusOne == 0) return;
        uint256 idx = idxPlusOne - 1;
        uint256 last = listedIds.length - 1;
        if (idx != last) {
            uint256 lastId = listedIds[last];
            listedIds[idx] = lastId;
            indexInListed[lastId] = idx + 1;
        }
        listedIds.pop();
        indexInListed[_tokenId] = 0;
    }

    // -------------------------
    // Marketplace flows
    // -------------------------

    /// @notice List property for sale (seller must approve this contract)
    function listProperty(uint256 _tokenId, uint256 _price) external whenNotPaused nonReentrant {
        require(_price > 0, "price > 0");
        // verify token owner
        address tokenOwner = IERC721Minimal(nftAddress).ownerOf(_tokenId);
        require(tokenOwner == msg.sender, "not token owner");

        // transfer NFT to escrow
        IERC721Minimal(nftAddress).transferFrom(msg.sender, address(this), _tokenId);

        listings[_tokenId] = Listing(payable(msg.sender), _price, true);
        purchaseAmount[_tokenId] = _price;
        sellerOf[_tokenId] = payable(msg.sender);

        _addToListed(_tokenId);

        emit Listed(_tokenId, msg.sender, _price);
    }

    /// @notice Update price for an existing active listing (only seller)
    function updateListingPrice(uint256 _tokenId, uint256 _newPrice) external whenNotPaused nonReentrant onlySeller(_tokenId) {
        Listing storage l = listings[_tokenId];
        require(l.active, "not listed");
        require(_newPrice > 0, "price > 0");
        l.price = _newPrice;
        purchaseAmount[_tokenId] = _newPrice;
        emit ListingUpdated(_tokenId, _newPrice);
    }

    /// @notice Cancel listing and return NFT to seller (only seller)
    function cancelListing(uint256 _tokenId) external whenNotPaused nonReentrant onlySeller(_tokenId) {
        Listing storage l = listings[_tokenId];
        require(l.active, "not listed");

        // snapshot
        address payable seller = l.seller;
        uint256 deposited = escrowDeposits[_tokenId];
        address currentBuyer = buyer[_tokenId];

        // clear listing state before external calls (checks-effects)
        l.active = false;
        purchaseAmount[_tokenId] = 0;
        buyer[_tokenId] = address(0);
        sellerOf[_tokenId] = payable(address(0));
        escrowDeposits[_tokenId] = 0;

        _removeFromListed(_tokenId);

        // return NFT to seller
        IERC721Minimal(nftAddress).transferFrom(address(this), seller, _tokenId);

        // refund buyer deposit if any (if present send back)
        if (deposited > 0 && currentBuyer != address(0)) {
            (bool refunded, ) = payable(currentBuyer).call{value: deposited}("");
            require(refunded, "refund failed");
            emit Refund(_tokenId, currentBuyer, deposited);
        }

        emit ListingCancelled(_tokenId, seller);
    }

    /// @notice Buyer deposits the full purchase amount into escrow (earnest)
    function depositEarnest(uint256 _tokenId) external payable whenNotPaused nonReentrant {
        Listing storage l = listings[_tokenId];
        require(l.active, "token not listed");
        require(msg.value > 0, "must deposit > 0");
        // if there's already a different buyer, reject (simple single-buyer escrow)
        address existingBuyer = buyer[_tokenId];
        if (existingBuyer == address(0)) {
            // new buyer
            require(msg.value >= l.price, "insufficient funds");
            buyer[_tokenId] = msg.sender;
            escrowDeposits[_tokenId] = msg.value;
        } else {
            require(existingBuyer == msg.sender, "already reserved by another buyer");
            // allow additive deposits by same buyer (but require total >= price)
            escrowDeposits[_tokenId] += msg.value;
            require(escrowDeposits[_tokenId] >= l.price, "total insufficient");
        }

        emit EarnestDeposited(_tokenId, msg.sender, msg.value);
    }

    /// @notice Direct buy (instant purchase) — buyer pays exact price (or more, excess refunded) and finalizes
    function buyNow(uint256 _tokenId) external payable whenNotPaused nonReentrant {
        Listing storage l = listings[_tokenId];
        require(l.active, "not listed");
        require(msg.value >= l.price, "insufficient funds");

        address payable seller = l.seller;
        address finalBuyer = msg.sender;
        uint256 amount = msg.value;
        uint256 price = l.price;

        // effects first: mark inactive and clear listing state
        l.active = false;
        purchaseAmount[_tokenId] = 0;
        _removeFromListed(_tokenId);

        // compute royalty via EIP-2981 if supported
        (address royaltyRecipient, uint256 royaltyAmount) = _getRoyaltyInfo(_tokenId, price);

        // compute platform fee (applies on gross sale price)
        uint256 platformFee = (price * platformFeeBps) / 10000;

        // sanity: price must cover royalty + fees
        require(price >= royaltyAmount + platformFee, "fees exceed price");

        uint256 sellerProceeds = price - royaltyAmount - platformFee;

        // forward platform fee immediately
        (bool sentFee, ) = feeRecipient.call{value: platformFee}("");
        require(sentFee, "platform fee transfer failed");

        // send royalty if present
        if (royaltyAmount > 0) {
            (bool royaltySent, ) = payable(royaltyRecipient).call{value: royaltyAmount}("");
            require(royaltySent, "royalty transfer failed");
            emit RoyaltyPaid(_tokenId, royaltyRecipient, royaltyAmount);
        }

        // send seller proceeds
        (bool sentSeller, ) = seller.call{value: sellerProceeds}("");
        require(sentSeller, "pay seller failed");

        // transfer NFT to buyer
        IERC721Minimal(nftAddress).transferFrom(address(this), finalBuyer, _tokenId);

        // Emit events for off-chain indexing instead of storing arrays on-chain
        emit NFTPurchased(finalBuyer, _tokenId, price);
        emit NFTSold(seller, _tokenId, price);

        // refund excess if buyer overpaid (amount - price)
        uint256 excess = amount - price;
        if (excess > 0) {
            (bool refundedExcess, ) = payable(finalBuyer).call{value: excess}("");
            require(refundedExcess, "refund excess failed");
            emit Refund(_tokenId, finalBuyer, excess);
        }

        emit DirectPurchased(_tokenId, finalBuyer, seller, price, platformFee, royaltyAmount);
    }

    /// @notice Finalize sale by buyer after depositEarnest (buyer who deposited calls this)
    function finalizeSale(uint256 _tokenId) external onlyBuyer(_tokenId) whenNotPaused nonReentrant {
        Listing storage l = listings[_tokenId];
        require(l.active, "not listed");
        uint256 deposited = escrowDeposits[_tokenId];
        require(deposited >= l.price, "insufficient funds deposited");

        address payable seller = l.seller;
        address finalBuyer = buyer[_tokenId];
        uint256 price = l.price;

        // effects first
        l.active = false;
        purchaseAmount[_tokenId] = 0;
        buyer[_tokenId] = address(0);
        sellerOf[_tokenId] = payable(address(0));
        escrowDeposits[_tokenId] = 0;

        _removeFromListed(_tokenId);

        // compute royalty via EIP-2981 if supported
        (address royaltyRecipient, uint256 royaltyAmount) = _getRoyaltyInfo(_tokenId, price);

        // compute platform fee
        uint256 platformFee = (price * platformFeeBps) / 10000;

        require(price >= royaltyAmount + platformFee, "fees exceed price");

        uint256 sellerProceeds = price - royaltyAmount - platformFee;

        // forward platform fee
        (bool sentFee, ) = feeRecipient.call{value: platformFee}("");
        require(sentFee, "platform fee transfer failed");

        // pay royalty if present
        if (royaltyAmount > 0) {
            (bool royaltySent, ) = payable(royaltyRecipient).call{value: royaltyAmount}("");
            require(royaltySent, "royalty transfer failed");
            emit RoyaltyPaid(_tokenId, royaltyRecipient, royaltyAmount);
        }

        // pay seller proceeds
        (bool success, ) = seller.call{value: sellerProceeds}("");
        require(success, "failed to send funds to seller");

        // transfer NFT to buyer
        IERC721Minimal(nftAddress).transferFrom(address(this), finalBuyer, _tokenId);

        // Emit events for off-chain indexing instead of storing arrays on-chain
        emit NFTPurchased(finalBuyer, _tokenId, price);
        emit NFTSold(seller, _tokenId, price);

        // If buyer had deposited more than price (shouldn't in normal flow) refund difference
        if (deposited > price) {
            uint256 extra = deposited - price;
            (bool refunded, ) = payable(finalBuyer).call{value: extra}("");
            require(refunded, "refund extra failed");
            emit Refund(_tokenId, finalBuyer, extra);
        }

        emit Finalized(_tokenId, finalBuyer, seller, price);
    }

    // -------------------------
    // Royalty helper
    // -------------------------
    /// @dev Returns (recipient, royaltyAmount) if token contract supports EIP-2981. Otherwise (address(0), 0).
    function _getRoyaltyInfo(uint256 tokenId, uint256 salePrice) internal view returns (address, uint256) {
        // check if the NFT contract supports ERC2981
        try IERC165(nftAddress).supportsInterface(type(IERC2981).interfaceId) returns (bool supports) {
            if (supports) {
                try IERC2981(nftAddress).royaltyInfo(tokenId, salePrice) returns (address receiver, uint256 royaltyAmount) {
                    // royaltyAmount may be zero if no royalty set
                    return (receiver, royaltyAmount);
                } catch {
                    // fallback to none
                    return (address(0), 0);
                }
            } else {
                return (address(0), 0);
            }
        } catch {
            return (address(0), 0);
        }
    }

    // -------------------------
    // Views / helpers
    // -------------------------
    function getListedIds() public view returns (uint256[] memory) {
        return listedIds;
    }

    function getListing(uint256 _tokenId) public view returns (Listing memory) {
        return listings[_tokenId];
    }

    function getAllListings()
        public
        view
        returns (
            uint256[] memory ids,
            address[] memory sellers,
            uint256[] memory prices,
            bool[] memory listed
        )
    {
        uint256 len = listedIds.length;
        ids = new uint256[](len);
        sellers = new address[](len);
        prices = new uint256[](len);
        listed = new bool[](len);

        for (uint256 i = 0; i < len; i++) {
            uint256 tokenId = listedIds[i];
            ids[i] = tokenId;
            sellers[i] = listings[tokenId].seller;
            prices[i] = listings[tokenId].price;
            listed[i] = listings[tokenId].active;
        }
    }

    /// @notice Previously returned on-chain arrays. Those were removed to avoid unbounded on-chain storage.
    /// Off-chain systems should use the emitted events `NFTPurchased` and `NFTSold` (and `DirectPurchased` / `Finalized`) to build user history.
    /// To keep compatibility, these functions still exist but return an empty array.
    function getPurchasedNfts(address /* _user */) public pure returns (uint256[] memory) {
        return new uint256;
    }

    function getSoldNfts(address /* _user */) public pure returns (uint256[] memory) {
        return new uint256;
    }

    function getPlatformInfo() public view returns (uint256 feeBps, address recipient) {
        return (platformFeeBps, feeRecipient);
    }

    // receive / fallback
    receive() external payable {
        revert("Direct deposits not allowed; use buyNow or depositEarnest");
    }

    fallback() external payable {
        revert("Fallback not allowed");
    }
}
