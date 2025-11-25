//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address _from, address _to, uint256 _id) external;
}

// make mapping of escrowDeposits
// make mapping of seller
// add check in list property function that owner can't buy its own property.
// add check in finalize sale that escrowDeposits should be greater than equal to purchase amount.

contract Escrow {
    address public nftAddress;

    mapping(uint => bool) public isListed;
    mapping(uint => uint) public purchaseAmount;
    mapping(uint => address) public buyer;
    mapping(uint => address payable) public sellerOf;
    mapping(uint => uint) public escrowDeposits;

    // easy enumeration of listed ids (for frontend)
    uint256[] private listedIds;
    mapping(uint256 => uint256) private indexInListed; // tokenId => index in listedIds + 1 (0 means not present)

    // Events
    event Listed(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
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

    /// @notice Internal: remove tokenId from listedIds using swap & pop
    function _removeFromListed(uint256 _nftId) internal {
        uint256 idxPlusOne = indexInListed[_nftId];
        if (idxPlusOne == 0) return; // if 0 means not present in array

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

    function listProperty(
        uint _nftId,
        address _buyer,
        uint _purchaseAmount
    ) public {
        // If already listed, fail early so tests (and callers) get the expected message
        require(!isListed[_nftId], "Already listed");

        address tokenOwner = IERC721(nftAddress).ownerOf(_nftId);
        require(
            tokenOwner == msg.sender,
            "Only token owners are allowed to list"
        );

        require(_buyer != msg.sender, "Owner can't buy its own token");

        require(_purchaseAmount > 0, "Purchase amount must be greater than 0");

        // transfer the ownership to contract
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftId);

        isListed[_nftId] = true;
        buyer[_nftId] = _buyer;
        purchaseAmount[_nftId] = _purchaseAmount;
        sellerOf[_nftId] = payable(msg.sender);

        // add to listedIds enumeration
        listedIds.push(_nftId);
        indexInListed[_nftId] = listedIds.length; // store index+1

        emit Listed(_nftId, msg.sender, _buyer, _purchaseAmount);
    }

    /// @notice Buyer deposits the exact purchase amount as earnest.
    function depositEarnest(uint _nftId) public payable {
        // check whether property is listed or not
        require(isListed[_nftId], "NFT not listed");

        require(msg.sender == buyer[_nftId], "Only buyer is allowed to do this action");

        require(
            msg.value >= purchaseAmount[_nftId],
            "Insufficient funds deposited"
        );

        // track escrow deposit for the token id
        escrowDeposits[_nftId] += msg.value;

        emit EarnestDeposited(_nftId, msg.sender, msg.value);
    }

    /// @notice Finalize sale: only the buyer can call; transfers NFT to buyer and sends funds to seller.
    function finalizeSale(uint _nftId) public onlyBuyer(_nftId) {
        require(isListed[_nftId] == true, "NFT is not listed");
        require(
            escrowDeposits[_nftId] >= purchaseAmount[_nftId],
            "Insufficient funds deposited"
        );

        address payable seller = sellerOf[_nftId];
        address finalBuyer = buyer[_nftId];

        // cleanup before external calls ----->

        isListed[_nftId] = false;
        // purchaseAmount[_nftId] = 0;
        // buyer[_nftId] = address(0);
        // sellerOf[_nftId] = payable(address(0));
        escrowDeposits[_nftId] = 0;

        (bool success, ) = seller.call{value: escrowDeposits[_nftId]}("");

        require(success, "Failed to finalize the sale");

        _removeFromListed(_nftId);

        // transfer the ownership to buyer
        IERC721(nftAddress).transferFrom(address(this), finalBuyer, _nftId);

        emit Finalized(_nftId, finalBuyer, seller, escrowDeposits[_nftId]);
    }

    /// @notice Cancel a listing: only seller can cancel before finalization. Refunds deposit to buyer if any.
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

        // remove from listing array
        _removeFromListed(_nftId);

        // return token to seller
        IERC721(nftAddress).transferFrom(address(this), seller, _nftId);

        // refund buyer if they had deposited
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

    /// @notice Returns listing details arrays that the frontend can consume in a single call
    function getAllListings()
        public
        view
        returns (
            uint256[] memory ids,
            address[] memory sellers,
            address[] memory buyers,
            uint256[] memory prices,
            bool[] memory listed
        )
    {
        uint256 len = listedIds.length;
        ids = new uint256[](len);
        sellers = new address[](len);
        buyers = new address[](len);
        prices = new uint256[](len);
        listed = new bool[](len);

        for (uint256 i = 0; i < len; i++) {
            uint256 tokenId = listedIds[i];
            ids[i] = tokenId;
            sellers[i] = sellerOf[tokenId];
            buyers[i] = buyer[tokenId];
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
