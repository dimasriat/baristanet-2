// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/BrewHouse.sol";
import "../src/interfaces/IWETH9.sol";
import "./MockWETH.sol";

contract BrewHouseTest is Test {
  BrewHouse public brewHouse;
  MockWETH public weth;

  address sequencer = vm.addr(1);
  address user = vm.addr(2);

  function setUp() public {
    weth = new MockWETH();
    vm.deal(user, 10 ether);
    vm.deal(sequencer, 10 ether);
    brewHouse = new BrewHouse(sequencer, address(weth));
  }

  function testDepositCollateral() public {
    vm.startPrank(user);
    brewHouse.depositCollateral{value: 1 ether}();
    assertEq(brewHouse.collateralBalance(user), 1 ether);
    vm.stopPrank();
  }

  function testWithdrawCollateral() public {
    vm.startPrank(user);
    brewHouse.depositCollateral{value: 2 ether}();
    brewHouse.withdrawCollateral(1 ether);
    assertEq(brewHouse.collateralBalance(user), 1 ether);
    vm.stopPrank();
  }

  function testWithdrawMoreThanCollateralShouldRevert() public {
    vm.startPrank(user);
    brewHouse.depositCollateral{value: 1 ether}();
    vm.expectRevert(BrewHouse.InsufficientCollateral.selector);
    brewHouse.withdrawCollateral(2 ether);
    vm.stopPrank();
  }

  function testOnlySequencerCanSlash() public {
    vm.startPrank(user);
    brewHouse.depositCollateral{value: 1 ether}();
    vm.stopPrank();

    vm.startPrank(address(3)); // Not sequencer
    vm.expectRevert(BrewHouse.OnlySequencer.selector);
    brewHouse.slashCollateral(user, 0.5 ether);
    vm.stopPrank();
  }

  function testSequencerCanSlash() public {
    vm.startPrank(user);
    brewHouse.depositCollateral{value: 1 ether}();
    vm.stopPrank();

    vm.startPrank(sequencer);
    brewHouse.slashCollateral(user, 0.5 ether);
    assertEq(brewHouse.collateralBalance(user), 0.5 ether);
    vm.stopPrank();
  }
}
