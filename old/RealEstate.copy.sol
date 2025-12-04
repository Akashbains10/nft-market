// File: contracts/RealEstate.sol
// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

/// OpenZeppelin imports
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title RealEstate ERC721 with EIP-2981 royalties per token
/// @notice Minting includes royalty recipient and royalty bps (in basis points)
contract RealEstate is ERC721URIStorage, ERC2981, Ownable {
    uint256 private _nextTokenId = 1;

    // Optional: maximum royalty in bps to guard against unbounded royalties (e.g., 1000 = 10%)
    uint96 public constant MAX_ROYALTY_BPS = 2000; // configurable guard

    event MintedWithRoyalty(uint256 indexed tokenId, address indexed minter, address royaltyRecipient, uint96 royaltyBps);

    constructor() ERC721("RealEstate", "REAL") {}

    /// @notice Mint a new property token and set per-token royalty using EIP-2981
    /// @param _tokenURI metadata URI
    /// @param _royaltyRecipient receiver of royalty payments (can be address(0) for none)
    /// @param _royaltyBps royalty in basis points (1% = 100). Use 0 for no royalty.
    function mintProperty(
        string memory _tokenURI,
        address _royaltyRecipient,
        uint96 _royaltyBps
    ) external returns (uint256) {
        require(_royaltyBps <= MAX_ROYALTY_BPS, "royalty too high");
        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        // If royalty recipient is non-zero and royaltyBps > 0, set token royalty
        if (_royaltyRecipient != address(0) && _royaltyBps > 0) {
            // ERC2981 _setTokenRoyalty uses feeDenominator = 10000 (bps)
            _setTokenRoyalty(tokenId, _royaltyRecipient, _royaltyBps);
        }

        emit MintedWithRoyalty(tokenId, msg.sender, _royaltyRecipient, _royaltyBps);
        return tokenId;
    }

    /// @notice total supply derived from sequential mint id
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    // ---- ERC165 / interface support ----
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Optional: owner-only helper to set default royalty for tokens that don't have per-token royalty
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        require(feeNumerator <= MAX_ROYALTY_BPS, "fee too high");
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function deleteDefaultRoyalty() external onlyOwner {
        _deleteDefaultRoyalty();
    }

    function resetTokenRoyalty(uint256 tokenId) external onlyOwner {
        _resetTokenRoyalty(tokenId);
    }
}
