//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;

    mapping(uint => bool) public isListed;
    mapping(uint => uint) public purchaseAmount;
    mapping(uint => address) public buyer;
    mapping(uint => address payable) public sellerOf;
    mapping(uint => uint) public escrowDeposits;
    mapping(address => uint256[]) private purchasedNFTs;
    mapping(address => uint256[]) private soldNFTs;

    // easy enumeration of listed ids (for frontend)
    uint256[] private listedIds;
    mapping(uint256 => uint256) private indexInListed; // tokenId => index in listedIds + 1 (0 means not present)

    // Events
    event Listed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
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

    constructor(address _nftAddress) {
        nftAddress = _nftAddress;
    }

    modifier onlyBuyer(uint _nftId) {
        require(
            msg.sender == buyer[_nftId],
            "Only buyer is allowed to do this action"
        );
        _;
    }

    modifier onlySeller(uint _nftId) {
        require(
            msg.sender == sellerOf[_nftId],
            "Only seller is allowed to do this action"
        );
        _;
    }

    function getPurchasedNfts(
        address _user
    ) public view returns (uint256[] memory) {
        return purchasedNFTs[_user];
    }

    function getSoldNfts(address _user) public view returns (uint256[] memory) {
        return soldNFTs[_user];
    }

    /// @notice Internal: remove tokenId from listedIds using swap & pop
    function _removeFromListed(uint256 _nftId) internal {
        uint256 idxPlusOne = indexInListed[_nftId];
        if (idxPlusOne == 0) return; // not present

        uint256 idx = idxPlusOne - 1;
        uint256 lastIndex = listedIds.length - 1;
        if (idx != lastIndex) {
            uint256 lastId = listedIds[lastIndex];
            listedIds[idx] = lastId;
            indexInListed[lastId] = idx + 1;
        }
        listedIds.pop();
        indexInListed[_nftId] = 0;
    }

    /// @notice List property (marketplace style, no buyer pre-defined)
    function listProperty(uint _nftId, uint _purchaseAmount) public {
        require(!isListed[_nftId], "Already listed");

        address tokenOwner = IERC721(nftAddress).ownerOf(_nftId);
        require(
            tokenOwner == msg.sender,
            "Only token owners are allowed to list"
        );
        require(_purchaseAmount > 0, "Purchase amount must be greater than 0");

        // transfer the NFT to the contract for escrow
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftId);

        isListed[_nftId] = true;
        purchaseAmount[_nftId] = _purchaseAmount;
        sellerOf[_nftId] = payable(msg.sender);

        listedIds.push(_nftId);
        indexInListed[_nftId] = listedIds.length; // store index+1

        emit Listed(_nftId, msg.sender, _purchaseAmount);
    }

    /// @notice Buyer deposits the full purchase amount upfront
    function depositEarnest(uint _nftId) public payable {
        require(isListed[_nftId], "NFT not listed");
        require(
            msg.value >= purchaseAmount[_nftId],
            "Insufficient funds deposited"
        );

        // track buyer and escrow deposit
        buyer[_nftId] = msg.sender;
        escrowDeposits[_nftId] += msg.value;

        emit EarnestDeposited(_nftId, msg.sender, msg.value);
    }

    /// @notice Finalize sale: transfers NFT to buyer and funds to seller
    function finalizeSale(uint _nftId) public onlyBuyer(_nftId) {
        require(isListed[_nftId], "NFT is not listed");
        require(
            escrowDeposits[_nftId] >= purchaseAmount[_nftId],
            "Insufficient funds deposited"
        );

        address payable seller = sellerOf[_nftId];
        address finalBuyer = buyer[_nftId];

        uint256 amount = escrowDeposits[_nftId];

        // track purchased NFTs for buyer
        purchasedNFTs[finalBuyer].push(_nftId);

        // track sold NFTs for seller
        soldNFTs[seller].push(_nftId);

        // cleanup before external calls
        isListed[_nftId] = false;
        purchaseAmount[_nftId] = 0;
        buyer[_nftId] = address(0);
        // sellerOf[_nftId] = payable(address(0));
        escrowDeposits[_nftId] = 0;

        _removeFromListed(_nftId);

        // send funds to seller
        (bool success, ) = seller.call{value: amount}("");
        require(success, "Failed to finalize the sale");

        // transfer NFT to buyer
        IERC721(nftAddress).transferFrom(address(this), finalBuyer, _nftId);

        emit Finalized(_nftId, finalBuyer, seller, amount);
    }

    /// @notice Cancel a listing: only seller can cancel before sale
    function cancelListing(uint256 _nftId) public onlySeller(_nftId) {
        require(isListed[_nftId], "NFT not listed");

        address payable seller = sellerOf[_nftId];
        address currentBuyer = buyer[_nftId];
        uint256 deposited = escrowDeposits[_nftId];

        // cleanup listing state
        isListed[_nftId] = false;
        purchaseAmount[_nftId] = 0;
        buyer[_nftId] = address(0);
        sellerOf[_nftId] = payable(address(0));
        escrowDeposits[_nftId] = 0;

        _removeFromListed(_nftId);

        // return NFT to seller
        IERC721(nftAddress).transferFrom(address(this), seller, _nftId);

        // refund buyer if deposited
        if (deposited > 0 && currentBuyer != address(0)) {
            (bool refunded, ) = payable(currentBuyer).call{value: deposited}(
                ""
            );
            require(refunded, "Refund to buyer failed");
        }

        emit ListingCancelled(_nftId, seller);
    }

    function getListedIds() public view returns (uint256[] memory) {
        return listedIds;
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
            sellers[i] = sellerOf[tokenId];
            prices[i] = purchaseAmount[tokenId];
            listed[i] = isListed[tokenId];
        }
    }

    receive() external payable {
        revert("Direct deposits not allowed; use depositEarnest");
    }

    fallback() external payable {
        revert("Fallback not allowed");
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
