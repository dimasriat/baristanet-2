// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/LattePool.sol";

contract LattePoolTest is Test {
  LattePool public pool;

  address user = address(0xBEEF);
  address anotherUser = address(0xCAFE);

  function setUp() public {
    pool = new LattePool();
    vm.deal(address(pool), 10 ether); // Fund the pool with ETH
    vm.deal(user, 5 ether);
    vm.deal(anotherUser, 5 ether);
  }

  function testBorrow() public {
    vm.startPrank(user);
    pool.borrow(1 ether);
    vm.stopPrank();

    assertEq(pool.debtBalance(user), 1 ether);
    assertEq(user.balance, 6 ether); // originally 5, now +1
  }

  function testBorrowInsufficientLiquidity() public {
    vm.startPrank(user);
    vm.expectRevert(LattePool.InsufficientLiquidity.selector);
    pool.borrow(11 ether); // more than pool has
    vm.stopPrank();
  }

  function testRepay() public {
    vm.startPrank(user);
    pool.borrow(2 ether);
    pool.repay{value: 1 ether}(); // repay partially
    vm.stopPrank();

    assertEq(pool.debtBalance(user), 1 ether);
  }

  function testRepayFull() public {
    vm.startPrank(user);
    pool.borrow(1.5 ether);
    pool.repay{value: 1.5 ether}();
    vm.stopPrank();

    assertEq(pool.debtBalance(user), 0);
  }

  function testRepayTooMuchRevert() public {
    vm.startPrank(user);
    pool.borrow(1 ether);
    vm.expectRevert(LattePool.RepayTooMuch.selector);
    pool.repay{value: 2 ether}(); // can't repay more than debt
    vm.stopPrank();
  }

  function testMultipleUsersIndependentDebt() public {
    vm.startPrank(user);
    pool.borrow(1 ether);
    vm.stopPrank();

    vm.startPrank(anotherUser);
    pool.borrow(2 ether);
    vm.stopPrank();

    assertEq(pool.debtBalance(user), 1 ether);
    assertEq(pool.debtBalance(anotherUser), 2 ether);
  }
}
