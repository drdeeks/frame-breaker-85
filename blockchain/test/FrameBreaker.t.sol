// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/StdUtils.sol"; // Import StdUtils for makeAddr
import "../src/FrameBreaker.sol";

contract FrameBreakerTest is Test {
    FrameBreaker fb;
    address player; // Use makeAddr for players
    address owner;

    function setUp() public {
        owner = address(this); // The contract deployer is the owner in tests
        fb = new FrameBreaker(owner, 0.01 ether); // Pass owner and initial fee
        player = makeAddr("player"); // Initialize player address
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
        fb.submitScore{value: 0.005 ether}("Bob", 100); // Less than 0.01 ether
    }

    function testSubmitScore_ExcessFeeRefund() public {
        uint256 initialPlayerBalance = 1 ether;
        vm.deal(player, initialPlayerBalance);
        vm.prank(player);

        uint256 excessAmount = 0.005 ether;
        uint256 sentValue = 0.01 ether + excessAmount; // 0.015 ether
        
        fb.submitScore{value: sentValue}("Charlie", 700);

        // Verify score submission
        FrameBreaker.Score[] memory leaderboard = fb.getLeaderboard(1);
        assertEq(leaderboard.length, 1); // Assuming this is the first score
        assertEq(leaderboard[0].score, 700);
        assertEq(leaderboard[0].player, player);

        // Verify refund
        assertEq(player.balance, initialPlayerBalance - 0.01 ether); // Initial - fee
    }

    function testSubmitScore_InvalidNameLengthTooLong() public {
        vm.deal(player, 1 ether);
        vm.prank(player);
        vm.expectRevert("Invalid name length");
        fb.submitScore{value: 0.01 ether}("ThisNameIsTooLong", 100); // Max 10 chars
    }

    function testSubmitScore_InvalidNameLengthEmpty() public {
        vm.deal(player, 1 ether);
        vm.prank(player);
        vm.expectRevert("Invalid name length");
        fb.submitScore{value: 0.01 ether}("", 100);
    }

    function testSubmitScore_WhenPaused() public {
        vm.prank(owner);
        fb.pause(); // Pause the contract

        vm.deal(player, 1 ether);
        vm.prank(player);
        vm.expectRevert("Pausable: paused");
        fb.submitScore{value: 0.01 ether}("Eve", 200);
    }

    function testSubmitScore_MultipleScoresAndSorting() public {
        address player2 = makeAddr("player2");
        address player3 = makeAddr("player3");

        vm.deal(player, 1 ether);
        vm.deal(player2, 1 ether);
        vm.deal(player3, 1 ether);

        vm.prank(player);
        fb.submitScore{value: 0.01 ether}("Alice", 500); // First score

        vm.prank(player2);
        fb.submitScore{value: 0.01 ether}("Bob", 700); // Second score, higher

        vm.prank(player3);
        fb.submitScore{value: 0.01 ether}("Charlie", 300); // Third score, lower

        vm.prank(player);
        fb.submitScore{value: 0.01 ether}("Alice", 600); // Alice submits again, higher than her first

        FrameBreaker.Score[] memory leaderboard = fb.getLeaderboard(4); // Get top 4 scores

        assertEq(leaderboard.length, 4);
        assertEq(leaderboard[0].score, 700); // Bob
        assertEq(leaderboard[1].score, 600); // Alice (second score)
        assertEq(leaderboard[2].score, 500); // Alice (first score)
        assertEq(leaderboard[3].score, 300); // Charlie
    }

    function testPauseAndUnpause_Owner() public {
        vm.prank(owner);
        fb.pause();
        assertTrue(fb.paused(), "Contract should be paused");

        fb.unpause();
        assertFalse(fb.paused(), "Contract should be unpaused");
    }

    function testPauseAndUnpause_NonOwner() public {
        address nonOwner = makeAddr("nonOwner");
        vm.prank(nonOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        fb.pause();

        vm.expectRevert("Ownable: caller is not the owner");
        fb.unpause();
    }

    function testSetSubmissionFee_Owner() public {
        uint256 newFee = 0.02 ether;
        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit FrameBreaker.SubmissionFeeUpdated(newFee);
        fb.setSubmissionFee(newFee);
        assertEq(fb.submissionFee(), newFee, "Submission fee should be updated");
    }

    function testSetSubmissionFee_NonOwner() public {
        address nonOwner = makeAddr("nonOwner2");
        vm.prank(nonOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        fb.setSubmissionFee(0.03 ether);
    }

    function testWithdrawFees_Owner() public {
        // Submit some scores to accumulate fees
        vm.deal(player, 1 ether);
        vm.prank(player);
        fb.submitScore{value: 0.01 ether}("Alice", 100);
        fb.submitScore{value: 0.01 ether}("Bob", 200);

        uint256 contractBalanceBefore = address(fb).balance;
        uint256 ownerBalanceBefore = owner.balance;

        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit FrameBreaker.FeesWithdrawn(owner, contractBalanceBefore);
        fb.withdrawFees(payable(owner));

        assertEq(address(fb).balance, 0, "Contract balance should be zero after withdrawal");
        assertEq(owner.balance, ownerBalanceBefore + contractBalanceBefore, "Owner balance should increase by contract balance");
    }

    function testWithdrawFees_NonOwner() public {
        // Submit some scores to accumulate fees
        vm.deal(player, 1 ether);
        vm.prank(player);
        fb.submitScore{value: 0.01 ether}("Alice", 100);

        address nonOwner = makeAddr("nonOwner3");
        vm.prank(nonOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        fb.withdrawFees(payable(nonOwner));
    }

    function testWithdrawFees_NoFees() public {
        vm.prank(owner);
        vm.expectRevert("No fees to withdraw");
        fb.withdrawFees(payable(owner));
    }

    function testGetLeaderboard() public {
        vm.deal(player, 1 ether);
        vm.prank(player);
        fb.submitScore{value: 0.01 ether}("Alice", 100);
        fb.submitScore{value: 0.01 ether}("Bob", 300);
        fb.submitScore{value: 0.01 ether}("Charlie", 200);

        FrameBreaker.Score[] memory top1 = fb.getLeaderboard(1);
        assertEq(top1.length, 1);
        assertEq(top1[0].score, 300); // Bob

        FrameBreaker.Score[] memory top3 = fb.getLeaderboard(3);
        assertEq(top3.length, 3);
        assertEq(top3[0].score, 300); // Bob
        assertEq(top3[1].score, 200); // Charlie
        assertEq(top3[2].score, 100); // Alice

        FrameBreaker.Score[] memory top10 = fb.getLeaderboard(10); // Request more than available
        assertEq(top10.length, 3); // Should return all available
    }

    function testGetPlayerScores() public {
        vm.deal(player, 1 ether);
        vm.prank(player);
        fb.submitScore{value: 0.01 ether}("Alice", 100);
        fb.submitScore{value: 0.01 ether}("Alice", 500); // Second score for Alice

        address player2 = makeAddr("player4");
        vm.deal(player2, 1 ether);
        vm.prank(player2);
        fb.submitScore{value: 0.01 ether}("Bob", 300);

        FrameBreaker.Score[] memory aliceScores = fb.getPlayerScores(player);
        assertEq(aliceScores.length, 2);
        // Note: getPlayerScores returns scores in insertion order, not sorted by score
        assertEq(aliceScores[0].score, 100);
        assertEq(aliceScores[1].score, 500);

        FrameBreaker.Score[] memory bobScores = fb.getPlayerScores(player2);
        assertEq(bobScores.length, 1);
        assertEq(bobScores[0].score, 300);

        FrameBreaker.Score[] memory nonExistentPlayerScores = fb.getPlayerScores(makeAddr("nonExistent"));
        assertEq(nonExistentPlayerScores.length, 0);
    }

    function testGetLeaderboardSize() public {
        assertEq(fb.getLeaderboardSize(), 0, "Initial leaderboard size should be 0");

        vm.deal(player, 1 ether);
        vm.prank(player);
        fb.submitScore{value: 0.01 ether}("Alice", 100);
        assertEq(fb.getLeaderboardSize(), 1, "Leaderboard size should be 1 after one submission");

        fb.submitScore{value: 0.01 ether}("Bob", 200);
        assertEq(fb.getLeaderboardSize(), 2, "Leaderboard size should be 2 after two submissions");
    }

    function testGetStats() public {
        (uint256 totalSubmissions, uint256 submissionFee, uint256 contractBalance) = fb.getStats();
        assertEq(totalSubmissions, 0, "Initial total submissions should be 0");
        assertEq(submissionFee, 0.01 ether, "Initial submission fee should be 0.01 ether");
        assertEq(contractBalance, 0, "Initial contract balance should be 0");

        vm.deal(player, 1 ether);
        vm.prank(player);
        fb.submitScore{value: 0.01 ether}("Alice", 100);

        (totalSubmissions, submissionFee, contractBalance) = fb.getStats();
        assertEq(totalSubmissions, 1, "Total submissions should be 1");
        assertEq(submissionFee, 0.01 ether, "Submission fee should remain 0.01 ether");
        assertEq(contractBalance, 0.01 ether, "Contract balance should be 0.01 ether");
    }

    function testReceive() public {
        address sender = makeAddr("sender");
        uint256 sendAmount = 0.5 ether;
        vm.deal(sender, sendAmount);

        uint256 contractBalanceBefore = address(fb).balance;
        
        vm.prank(sender);
        (bool success, ) = address(fb).call{value: sendAmount}("");
        assertTrue(success, "Receive function call should be successful");

        assertEq(address(fb).balance, contractBalanceBefore + sendAmount, "Contract balance should increase by sent amount");
    }

    function testUpgradeContract_Owner() public {
        address newContractAddress = makeAddr("newContract");
        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit FrameBreaker.ContractUpgraded(newContractAddress);
        fb.upgradeContract(newContractAddress);
    }

    function testUpgradeContract_NonOwner() public {
        address nonOwner = makeAddr("nonOwner5");
        vm.prank(nonOwner);
        vm.expectRevert("Ownable: caller is not the owner");
        fb.upgradeContract(makeAddr("newContract2"));
    }
}