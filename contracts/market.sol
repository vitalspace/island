// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MarketplaceNFT {
    struct Listing {
        address seller;
        uint256 price; // Precio en tokens ERC20
    }

    // NFT contract address => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    IERC20 public pagoToken;

    constructor(address tokenAddress) {
        pagoToken = IERC20(tokenAddress);
    }

    // Función para listar un NFT a la venta
    function listarNFT(address nftAddress, uint256 tokenId, uint256 precio) public {
        IERC721 nft = IERC721(nftAddress);
        // El vendedor debe ser el dueño y aprobar el marketplace
        require(nft.ownerOf(tokenId) == msg.sender, "No eres el propietario");
        require(
            nft.getApproved(tokenId) == address(this) || nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace no aprobado"
        );
        listings[nftAddress][tokenId] = Listing(msg.sender, precio);
    }

    // Función para comprar un NFT listado
    function comprarNFT(address nftAddress, uint256 tokenId) public {
        Listing memory item = listings[nftAddress][tokenId];
        require(item.seller != address(0), "NFT no listado");
        // Transferir el pago del comprador al vendedor
        require(
            pagoToken.transferFrom(msg.sender, item.seller, item.price),
            "Transferencia de tokens fallida"
        );

        // Transferir el NFT del vendedor al comprador
        IERC721(nftAddress).transferFrom(item.seller, msg.sender, tokenId);

        // Eliminar la lista
        delete listings[nftAddress][tokenId];
    }

    // Función para cancelar la lista del NFT (solo el vendedor puede cancelar)
    function cancelarListado(address nftAddress, uint256 tokenId) public {
        Listing memory item = listings[nftAddress][tokenId];
        require(item.seller == msg.sender, "No eres el vendedor");
        delete listings[nftAddress][tokenId];
    }
}
