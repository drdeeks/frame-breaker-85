// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/StdUtils.sol";
import "../contracts/FrameBreaker.sol";

contract FrameBreakerTest is Test {
    FrameBreaker fb;
    address player;
    address owner;
    uint256 constant INITIAL_FEE = 0.01 ether;
    uint256 constant MAX_LEADERBOARD_SIZE = 100;

    function setUp() public {
        owner = address(this);
        // Updated constructor call
        fb = new FrameBreaker(INITIAL_FEE, MAX_LEADERBOARD_SIZE);
        player = makeAddr("player");
    }

    function test_Init() public {
        assertEq(fb.owner(), owner, "Owner should be the deployer");
        assertEq(fb.submissionFee(), INITIAL_FEE, "Incorrect initial fee");
        assertEq(fb.MAX_LEADERBOARD_SIZE(), MAX_LEADERBOARD_SIZE, "Incorrect max leaderboard size");
    }

    function testSubmitScore() public {
        vm.deal(player, 1 ether);
        vm.prank(player);
        fb.submitScore{value: INITIAL_FEE}("Alice", 500);
        FrameBreaker.Score[] memory leaderboard = fb.getLeaderboard(1);
        assertEq(leaderboard.length, 1);
        assertEq(leaderboard[0].score, 500);
        assertEq(leaderboard[0].player, player);
    }

    function test_RevertIf_SubmitScore_InsufficientFee() public {
        vm.deal(player, 1 ether);
        vm.prank(player);
        // Updated to use custom error
        vm.expectRevert(abi.encodeWithSelector(FrameBreaker.InsufficientFee.selector, INITIAL_FEE, 0.005 ether));
        fb.submitScore{value: 0.005 ether}("Bob", 100);
    }

    function testSubmitScore_ExcessFeeRefund() public {
        uint256 initialPlayerBalance = 1 ether;
        vm.deal(player, initialPlayerBalance);
        vm.prank(player);
        uint256 sentValue = 0.015 ether;
        fb.submitScore{value: sentValue}("Charlie", 700);
        assertEq(player.balance, initialPlayerBalance - INITIAL_FEE, "Refund was not correct");
    }

    function test_RevertIf_SubmitScore_InvalidNameLength() public {
        vm.deal(player, 1 ether);
        vm.prank(player);
        string memory longName = "12345678901234567"; // 17 chars
        // Updated to use custom error
        vm.expectRevert(abi.encodeWithSelector(FrameBreaker.InvalidName.selector, longName));
        fb.submitScore{value: INITIAL_FEE}(longName, 100);

        string memory emptyName = "";
        vm.expectRevert(abi.encodeWithSelector(FrameBreaker.InvalidName.selector, emptyName));
        fb.submitScore{value: INITIAL_FEE}(emptyName, 100);
    }

    function testSubmitScore_ValidNameLength() public {
        vm.deal(player, 1 ether);
        vm.prank(player);

        // Test max length
        string memory maxName = "1234567890123456"; // 16 chars
        fb.submitScore{value: INITIAL_FEE}(maxName, 600);
        FrameBreaker.Score[] memory leaderboard = fb.getLeaderboard(1);
        assertEq(leaderboard[0].score, 600);
        assertEq(leaderboard[0].playerName, maxName);

        // Test min length
        string memory minName = "A";
        address player2 = makeAddr("player2");
        vm.deal(player2, 1 ether);
        vm.prank(player2);
        fb.submitScore{value: INITIAL_FEE}(minName, 700);
        leaderboard = fb.getLeaderboard(1);
        assertEq(leaderboard[0].score, 700);
        assertEq(leaderboard[0].playerName, minName);
    }

    function test_RevertWhen_SubmitScore_IsPaused() public {
        vm.prank(owner);
        fb.pause();
        vm.deal(player, 1 ether);
        vm.prank(player);
        vm.expectRevert("Pausable: paused");
        fb.submitScore{value: INITIAL_FEE}("Eve", 200);
    }

    function testLeaderboardIsCappedAndSorted() public {
        for (uint256 i = 0; i < MAX_LEADERBOARD_SIZE; i++) {
            address newPlayer = makeAddr(string(abi.encodePacked("player", vm.toString(i))));
            vm.deal(newPlayer, 1 ether);
            vm.prank(newPlayer);
            fb.submitScore{value: INITIAL_FEE}("Player", 100 + i);
        }

        assertEq(fb.getLeaderboardSize(), MAX_LEADERBOARD_SIZE, "Leaderboard size should be capped");

        FrameBreaker.Score[] memory leaderboard = fb.getLeaderboard(MAX_LEADERBOARD_SIZE);
        assertEq(leaderboard[0].score, 100 + MAX_LEADERBOARD_SIZE - 1, "Highest score should be at the top");
        assertEq(leaderboard[MAX_LEADERBOARD_SIZE - 1].score, 100, "Lowest score should be at the bottom");

        vm.deal(player, 1 ether);
        vm.prank(player);
        fb.submitScore{value: INITIAL_FEE}("LowScorer", 50);
        assertEq(fb.getLeaderboardSize(), MAX_LEADERBOARD_SIZE, "Leaderboard size should not change for a low score");
        leaderboard = fb.getLeaderboard(MAX_LEADERBOARD_SIZE);
        assertEq(leaderboard[MAX_LEADERBOARD_SIZE - 1].score, 100, "Lowest score should remain unchanged");

        address highScorer = makeAddr("highScorer");
        vm.deal(highScorer, 1 ether);
        vm.prank(highScorer);
        fb.submitScore{value: INITIAL_FEE}("HighScorer", 500);
        assertEq(fb.getLeaderboardSize(), MAX_LEADERBOARD_SIZE, "Leaderboard size should remain capped");
        leaderboard = fb.getLeaderboard(MAX_LEADERBOARD_SIZE);
        assertEq(leaderboard[0].score, 500, "New high score should be at the top");
        assertEq(leaderboard[MAX_LEADERBOARD_SIZE - 1].score, 101, "Old lowest score should be kicked out");
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
        fb.submitScore{value: INITIAL_FEE}("Alice", 100);

        uint256 balanceBefore = owner.balance;
        vm.prank(owner);
        fb.withdrawFees(payable(owner));
        assertEq(address(fb).balance, 0);
        assertEq(owner.balance, balanceBefore + INITIAL_FEE);

        address nonOwner = makeAddr("nonOwner3");
        vm.prank(nonOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        fb.withdrawFees(payable(nonOwner));
    }

    function test_RevertIf_WithdrawFees_NoFees() public {
        vm.prank(owner);
        // Updated to use custom error
        vm.expectRevert(abi.encodeWithSelector(FrameBreaker.NoFeesToWithdraw.selector));
        fb.withdrawFees(payable(owner));
    }

    // Allow the test contract to receive Ether
    receive() external payable {}
}