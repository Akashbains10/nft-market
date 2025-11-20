//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract RealEstate is ERC721URIStorage {
    uint256 private _nextTokenId = 1;

    constructor() ERC721("RealEstate", "REAL") {}

    function mintProperty(string memory _tokenURI) public returns (uint) {
        uint tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        return tokenId;
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;   // correct supply
    }
}
