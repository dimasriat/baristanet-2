// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LattePool is ReentrancyGuard {
    mapping(address => uint256) public debtBalance;

    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);

    error InsufficientLiquidity();
    error RepayTooMuch();

    constructor() {}

    receive() external payable {}

    /// @notice Borrow ETH from the pool
    function borrow(uint256 amount) external nonReentrant {
        if (address(this).balance < amount) revert InsufficientLiquidity();

        debtBalance[msg.sender] += amount;
        payable(msg.sender).transfer(amount);

        emit Borrowed(msg.sender, amount);
    }

    /// @notice Repay ETH debt by sending ETH
    function repay() external payable nonReentrant {
        if (msg.value > debtBalance[msg.sender]) revert RepayTooMuch();

        debtBalance[msg.sender] -= msg.value;
        emit Repaid(msg.sender, msg.value);
    }
}

