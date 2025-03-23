// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IWETH9 as IWETH} from "./interfaces/IWETH9.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BrewHouse is ReentrancyGuard {
    using SafeERC20 for IERC20;

    error InsufficientCollateral();
    error OnlySequencer();

    address public sequencer;
    IWETH public weth;

    mapping(address => uint256) public collateralBalance;

    constructor(address _sequencer, address _weth) {
        sequencer = _sequencer;
        weth = IWETH(_weth);
    }

    function depositCollateral() external payable nonReentrant {
        weth.deposit{value: msg.value}();
        collateralBalance[msg.sender] += msg.value;
    }

    function withdrawCollateral(uint256 amount) external nonReentrant {
        if (collateralBalance[msg.sender] < amount) revert InsufficientCollateral();
        collateralBalance[msg.sender] -= amount;
        weth.withdraw(amount);
        payable(msg.sender).transfer(amount);
    }

    function slashCollateral(address user, uint256 amount) external onlySequencer {
        collateralBalance[user] -= amount;
        weth.withdraw(amount);
        payable(sequencer).transfer(amount);
    }

    receive() external payable {}

    modifier onlySequencer() {
        if (msg.sender != sequencer) revert OnlySequencer();
        _;
    }
}
