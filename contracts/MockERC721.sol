// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockERC721 {
    mapping(uint256 => address) public owners;
    mapping(uint256 => address) public tokenApprovals;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed spender, uint256 indexed tokenId);

    function mint(address to, uint256 tokenId) external {
        owners[tokenId] = to;
        emit Transfer(address(0), to, tokenId);
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        return owners[tokenId];
    }

    function approve(address spender, uint256 tokenId) external {
        address owner = owners[tokenId];
        require(msg.sender == owner, "Only owner can approve");

        tokenApprovals[tokenId] = spender;
        emit Approval(owner, spender, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) external {
        require(owners[tokenId] == from, "Not owner");
        require(
            msg.sender == from || 
            msg.sender == tokenApprovals[tokenId],
            "Not authorized"
        );

        owners[tokenId] = to;
        tokenApprovals[tokenId] = address(0); // Clear approval

        emit Transfer(from, to, tokenId);
    }
}
