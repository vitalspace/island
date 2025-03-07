// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Island is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        address initialAddress,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(initialAddress, initialSupply * 10**decimals());
    }
}