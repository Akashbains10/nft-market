// File: contracts/MarketplaceEscrow.sol
// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

interface IERC721Minimal {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address _from, address _to, uint256 _id) external;
    function isApprovedForAll(
        address owner,
        address operator
    ) external view returns (bool);
    function getApproved(uint256 tokenId) external view returns (address);
}

/// @title Escrow - marketplace with escrow, platform fee and EIP-2981 royalty payouts
contract Escrow is ReentrancyGuard, Ownable, Pausable {
    address public nftAddress;

    // marketplace fee in basis points (bps). 100 bps = 1%
    uint256 public platformFeeBps; // e.g., 250 = 2.5%
    address payable public feeRecipient;

    //Listings
    struct Listing {
        address payable seller;
        uint256 price; //wei
        bool active;
    }

    mapping(uint256 => Listing) public listings;

    // escrow / deposit tracking for earnest deposits
    mapping(uint256 => address) public buyer; // tokenId => buyer (depositor)
    mapping(uint256 => uint256) public purchaseAmount; // mirrors listing price

    // Events
    event Listed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event ListingUpdated(uint256 indexed tokenId, uint256 newPrice);
    event EarnestDeposited(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 amount
    );
    event Finalized(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event DirectPurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 fee,
        uint256 royalty
    );
    event PlatformFeeChanged(uint256 newFeeBps);
    event FeeRecipientChanged(address newRecipient);
    event NFTAddressUpdated(address newAddress);
    event RoyaltyPaid(
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 amount
    );
    event Refund(uint256 indexed tokenId, address indexed to, uint256 amount);

    // New events for off-chain indexing (replace on-chain arrays)
    event NFTPurchased(
        address indexed buyer,
        uint256 indexed tokenId,
        uint256 price
    );
    event NFTSold(
        address indexed seller,
        uint256 indexed tokenId,
        uint256 price
    );

    // modifiers
    modifier onlySeller(uint256 tokenId) {
        require(listings[tokenId].seller == msg.sender, "only seller");
        _;
    }
    modifier onlyBuyer(uint256 tokenId) {
        require(buyer[tokenId] == msg.sender, "only buyer");
        _;
    }

    constructor(address _nftAddress) Ownable(msg.sender) {
        require(_nftAddress != address(0), "invalid nft");
        // require(_feeRecipient != address(0), "invalid fee recipient");
        // require(_platformFeeBps <= 1000, "fee too high"); // default guard (<=10%)
        nftAddress = _nftAddress;
        // feeRecipient = _feeRecipient;
        // platformFeeBps = _platformFeeBps;
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
    function withdrawStuck(
        address payable _to,
        uint256 _amount
    ) external onlyOwner nonReentrant {
        require(_to != address(0), "zero address");
        (bool sent, ) = _to.call{value: _amount}("");
        require(sent, "Withdraw failed");
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function updateNFTAddress(address _newAddress) external onlyOwner {
        require(_newAddress != address(0), "Zero address is not valid");
        nftAddress = _newAddress;
        emit NFTAddressUpdated(_newAddress);
    }

    // -------------------------
    // Marketplace flows
    // -------------------------

    /// @notice List property for sale (seller must approve this contract)

    function listProperty(
        uint256 _tokenId,
        uint256 _price
    ) external whenNotPaused nonReentrant {
        require(_price > 0, "Price should not be zero");

        address tokenOwner = IERC721Minimal(nftAddress).ownerOf(_tokenId);
        require(tokenOwner == msg.sender, "Not token owner");

        // transfer NFT to escrow
        IERC721Minimal(nftAddress).transferFrom(
            msg.sender,
            address(this),
            _tokenId
        );

        listings[_tokenId] = Listing(payable(msg.sender), _price, true);
        emit Listed(_tokenId, msg.sender, _price);
    }

    /// @notice Update price for an existing active listing (only seller)
    function updateListingPrice(
        uint256 _tokenId,
        uint256 _newPrice
    ) external whenNotPaused nonReentrant onlySeller(_tokenId) {
        Listing storage l = listings[_tokenId];
        require(l.active, "NFT not listed");
        require(_newPrice > 0, "Price should not be zero");
        l.price = _newPrice;
        emit ListingUpdated(_tokenId, _newPrice);
    }

    /// @notice Cancel listing and return NFT to seller (only seller)
    function cancelListing(
        uint256 _tokenId
    ) external whenNotPaused nonReentrant onlySeller(_tokenId) {
        Listing storage l = listings[_tokenId];
        require(l.active, "NFT not listed");

        // transfer NFT from contract to seller
        IERC721Minimal(nftAddress).transferFrom(
            address(this),
            l.seller,
            _tokenId
        );

        // clean states
        l.active = false;
        buyer[_tokenId] = address(0);

        // emit cancel event
        emit ListingCancelled(_tokenId, l.seller);
    }

    /// @notice Direct buy (instant purchase) — buyer pays exact price (or more, excess refunded) and finalizes

    function buyNow(
        uint256 _tokenId
    ) external payable whenNotPaused nonReentrant {
        Listing storage l = listings[_tokenId];
        address payable seller = l.seller;
        uint256 price = l.price;
        address finalBuyer = msg.sender;

        // validate that nft is listed or active
        require(l.active, "NFT is not listed");

        // validate feeRecipient address
        require(feeRecipient != address(0), "feeRecipient address should not be zero");

        // validate buyer address
        require(finalBuyer != address(0), "Buyer address should not be zero");

        // validate buyer address
        require(finalBuyer != seller, "Seller is not allowed to buy");

        // validate buyer paid amount must be match with purchase price
        require(msg.value >= price, "Insufficient Funds");

        // clean states
        l.active = false;
        l.price = 0;

        // compute royalty via EIP-2981 if supported
        (address royaltyRecipient, uint256 royaltyAmount) = _getRoyaltyInfo(
            _tokenId,
            price
        );

        // compute platform fee (applies on gross sale price)
        uint256 platformFee = (price * platformFeeBps) / 10000;

        // sanity: price must cover royalty + fees
        require(
            price >= royaltyAmount + platformFee,
            "Fees exceeds than NFT Price"
        );

        // forward platform fee immediately
        (bool paid, ) = feeRecipient.call{value: platformFee}(" ");
        require(paid, "Platform fee transfer failed");

        // send royalty if present
        if (royaltyAmount > 0) {
            (bool sent, ) = payable(royaltyRecipient).call{
                value: royaltyAmount
            }("");
            require(sent, "Royalty amount transfer failed");
            emit RoyaltyPaid(_tokenId, royaltyRecipient, royaltyAmount);
        }

        // send seller amount
        uint256 sellerAmount = price - royaltyAmount - platformFee;
        (bool sellerSent, ) = seller.call{value: sellerAmount}("");
        require(sellerSent, "Seller amount transfer failed");

        // transfer NFT to buyer
        IERC721Minimal(nftAddress).transferFrom(
            address(this),
            finalBuyer,
            _tokenId
        );

        // Emit events for off-chain indexing instead of storing arrays on-chain
        emit NFTPurchased(finalBuyer, _tokenId, price);
        emit NFTSold(seller, _tokenId, price);

        // refund excess if buyer overpaid
        uint256 overPaidAmount = msg.value - price;

        if (overPaidAmount > 0) {
            (bool sent, ) = payable(finalBuyer).call{value: overPaidAmount}("");
            require(sent, "Refund transfer failed");
            emit Refund(_tokenId, finalBuyer, overPaidAmount);
        }

        emit DirectPurchased(
            _tokenId,
            finalBuyer,
            seller,
            price,
            platformFee,
            royaltyAmount
        );
    }

    // -------------------------
    // Royalty helper
    // -------------------------
    /// @dev Returns (recipient, royaltyAmount) if token contract supports EIP-2981. Otherwise (address(0), 0).
    function _getRoyaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) internal view returns (address, uint256) {
        // check if the NFT contract supports ERC2981
        try
            IERC165(nftAddress).supportsInterface(type(IERC2981).interfaceId)
        returns (bool isSupport) {
            if (isSupport) {
                try
                    IERC2981(nftAddress).royaltyInfo(tokenId, salePrice)
                returns (address receiver, uint256 royaltyAmount) {
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

    function getListing(uint256 _tokenId) public view returns (Listing memory) {
        return listings[_tokenId];
    }

    function getPlatformInfo()
        public
        view
        returns (uint256 feeBps, address recipient)
    {
        return (platformFeeBps, feeRecipient);
    }

    // receive / fallback
    receive() external payable {
        revert("Direct deposits not allowed; use buyNow");
    }

    // fallback will trigger if user call any non-existent function
    fallback() external payable {
        revert("Fallback not allowed");
    }
}
