//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;

    mapping(uint => bool) public isListed;
    mapping(uint => uint) public purchaseAmount;
    mapping(uint => address) public buyer;

    constructor(address _nftAddress, address _seller) {
        nftAddress = _nftAddress;
        seller = payable(_seller);
    }

    modifier onlyBuyer(uint _nftId) {
        require(
            msg.sender == buyer[_nftId],
            "Only buyer is allowed to do this action"
        );
        _;
    }

    function listProperty(
        uint _nftId,
        address _buyer,
        uint _purchaseAmount
    ) public {
        // transfer the ownership to contract
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftId);

        isListed[_nftId] = true;
        buyer[_nftId] = _buyer;
        purchaseAmount[_nftId] = _purchaseAmount;
    }

    // buyer will pay the earnest deposit
    function depositEarnest(uint _nftId) public payable onlyBuyer(_nftId) {
        require(
            msg.value >= purchaseAmount[_nftId],
            "Insufficient funds deposited"
        );
    }

    function finalizeSale(uint _nftId) public onlyBuyer(_nftId) {
        // validate that contract recieve the sufficient ethers
        require(address(this).balance >= purchaseAmount[_nftId], "Insufficient funds to finalize");

        // send purchase price ethers to seller
        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );

        require(success, "Failed to finalize the sale");

        // transfer the ownership to buyer
        // IERC721(nftAddress).transferFrom(address(this), buyer[_nftId], _nftId);
    }

    receive() external payable {}

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
