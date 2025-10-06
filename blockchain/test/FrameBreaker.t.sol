// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/StdUtils.sol";
import "../contracts/FrameBreaker.sol";

contract FrameBreakerTest is Test {
    FrameBreaker fb;
    address player;
    address owner;
    uint256 maxScores;

    function setUp() public {
        owner = address(this);
        fb = new FrameBreaker(owner, 0.01 ether);
        player = makeAddr("player");
        maxScores = fb.MAX_LEADERBOARD_SIZE();
    }

    function testSubmitScore() public {
        vm.deal(player, 1 ether);
        vm.prank(player);
        fb.submitScore{value: 0.01 ether}("Alice", 500);
        FrameBreaker.Score[] memory leaderboard = fb.getLeaderboard(1);
        assertEq(leaderboard.length, 1);
        assertEq(leaderboard[0].score, 500);
        assertEq(leaderboard[0].player, player);
    }

    function testSubmitScore_InsufficientFee() public {
        vm.deal(player, 1 ether);
        vm.prank(player);
        vm.expectRevert("Insufficient submission fee");
        fb.submitScore{value: 0.005 ether}("Bob", 100);
    }

    function testSubmitScore_ExcessFeeRefund() public {
        uint256 initialPlayerBalance = 1 ether;
        vm.deal(player, initialPlayerBalance);
        vm.prank(player);
        uint256 sentValue = 0.015 ether;
        fb.submitScore{value: sentValue}("Charlie", 700);
        assertEq(player.balance, initialPlayerBalance - 0.01 ether);
    }

    function testSubmitScore_InvalidNameLength() public {
        vm.deal(player, 1 ether);
        vm.prank(player);
        vm.expectRevert("Invalid name length");
        fb.submitScore{value: 0.01 ether}("ThisNameIsWayTooLong", 100);
        vm.expectRevert("Invalid name length");
        fb.submitScore{value: 0.01 ether}("", 100);
    }

    function testSubmitScore_WhenPaused() public {
        vm.prank(owner);
        fb.pause();
        vm.deal(player, 1 ether);
        vm.prank(player);
        vm.expectRevert("Pausable: paused");
        fb.submitScore{value: 0.01 ether}("Eve", 200);
    }

    function testLeaderboardIsCappedAndSorted() public {
        for (uint256 i = 0; i < maxScores; i++) {
            address newPlayer = makeAddr(string(abi.encodePacked("player", vm.toString(i))));
            vm.deal(newPlayer, 1 ether);
            vm.prank(newPlayer);
            fb.submitScore{value: 0.01 ether}("Player", 100 + i);
        }

        assertEq(fb.getLeaderboardSize(), maxScores, "Leaderboard size should be capped");

        FrameBreaker.Score[] memory leaderboard = fb.getLeaderboard(maxScores);
        assertEq(leaderboard[0].score, 100 + maxScores - 1, "Highest score should be at the top");
        assertEq(leaderboard[maxScores - 1].score, 100, "Lowest score should be at the bottom");

        vm.deal(player, 1 ether);
        vm.prank(player);
        fb.submitScore{value: 0.01 ether}("LowScorer", 50);
        assertEq(fb.getLeaderboardSize(), maxScores, "Leaderboard size should not change for a low score");
        leaderboard = fb.getLeaderboard(maxScores);
        assertEq(leaderboard[maxScores - 1].score, 100, "Lowest score should remain unchanged");

        address highScorer = makeAddr("highScorer");
        vm.deal(highScorer, 1 ether);
        vm.prank(highScorer);
        fb.submitScore{value: 0.01 ether}("HighScorer", 500);
        assertEq(fb.getLeaderboardSize(), maxScores, "Leaderboard size should remain capped");
        leaderboard = fb.getLeaderboard(maxScores);
        assertEq(leaderboard[0].score, 500, "New high score should be at the top");
        assertEq(leaderboard[maxScores - 1].score, 101, "Old lowest score should be kicked out");
    }

    function testPauseAndUnpause() public {
        vm.prank(owner);
        fb.pause();
        assertTrue(fb.paused());
        vm.prank(owner);
        fb.unpause();
        assertFalse(fb.paused());

        address nonOwner = makeAddr("nonOwner");
        vm.prank(nonOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        fb.pause();
    }

    function testSetSubmissionFee() public {
        uint256 newFee = 0.02 ether;
        vm.prank(owner);
        fb.setSubmissionFee(newFee);
        assertEq(fb.submissionFee(), newFee);

        address nonOwner = makeAddr("nonOwner2");
        vm.prank(nonOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        fb.setSubmissionFee(0.03 ether);
    }

    function testWithdrawFees() public {
        vm.deal(player, 1 ether);
        vm.prank(player);
        fb.submitScore{value: 0.01 ether}("Alice", 100);

        uint256 balanceBefore = owner.balance;
        vm.prank(owner);
        fb.withdrawFees(payable(owner));
        assertEq(address(fb).balance, 0);
        assertEq(owner.balance, balanceBefore + 0.01 ether);

        address nonOwner = makeAddr("nonOwner3");
        vm.prank(nonOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        fb.withdrawFees(payable(nonOwner));
    }
}