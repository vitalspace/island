// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MiNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Dirección del contrato ERC20
    IERC20 public pagoToken;
    uint256 public precioMint;

    constructor(address tokenAddress, uint256 _precioMint) ERC721("MiNFT", "MNFT") {
        pagoToken = IERC20(tokenAddress);
        precioMint = _precioMint;
    }

    function mintNFT(string memory tokenURI) public returns (uint256) {
        // Transferencia de tokens desde el usuario al contrato (o a otra cuenta) por el costo del NFT
        require(
            pagoToken.transferFrom(msg.sender, address(this), precioMint),
            "Pago en token ERC20 fallido"
        );

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
}
