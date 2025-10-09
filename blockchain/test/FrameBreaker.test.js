const { expect } = require("chai");
const { ethers } = require("hardhat");
require("@nomicfoundation/hardhat-chai-matchers");

describe("FrameBreaker", function () {
  let FrameBreaker;
  let frameBreaker;
  let owner;
  let player1;
  let player2;
  let player3;
  let submissionFee;

  beforeEach(async function () {
    // Get signers
    [owner, player1, player2, player3] = await ethers.getSigners();

    // Set submission fee to 0.001 ETH
    submissionFee = ethers.parseEther("0.001");

    // Deploy contract
    FrameBreaker = await ethers.getContractFactory("FrameBreaker");
    frameBreaker = await FrameBreaker.deploy(submissionFee);
    await frameBreaker.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await frameBreaker.owner()).to.equal(owner.address);
    });

    it("Should set the correct submission fee", async function () {
      expect(await frameBreaker.submissionFee()).to.equal(submissionFee);
    });

    it("Should start with 0 total submissions", async function () {
      expect(await frameBreaker.totalSubmissions()).to.equal(0n);
    });

    it("Should start unpaused", async function () {
      expect(await frameBreaker.paused()).to.equal(false);
    });
  });

  describe("Score Submission", function () {
    it("Should submit a score successfully", async function () {
      const playerName = "Player1";
      const score = 1000;

      await frameBreaker.connect(player1).submitScore(playerName, score, {
        value: submissionFee
      });

      expect(await frameBreaker.totalSubmissions()).to.equal(1n);

      const submittedScore = await frameBreaker.getScore(0);
      expect(submittedScore.playerName).to.equal(playerName);
      expect(submittedScore.score).to.equal(BigInt(score));
      expect(submittedScore.player).to.equal(player1.address);
    });

    it("Should emit ScoreSubmitted event", async function () {
      const playerName = "Player1";
      const score = 1000;

      const tx = await frameBreaker.connect(player1).submitScore(playerName, score, {
        value: submissionFee
      });
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      const timestamp = block.timestamp;

      await expect(tx)
        .to.emit(frameBreaker, "ScoreSubmitted")
        .withArgs(player1.address, playerName, score, timestamp);
    });

    it("Should reject submission with insufficient fee", async function () {
      const playerName = "Player1";
      const score = 1000;
      const insufficientFee = ethers.parseEther("0.0005");

      await expect(
        frameBreaker.connect(player1).submitScore(playerName, score, {
          value: insufficientFee
        })
      ).to.be.revertedWith("Insufficient submission fee");
    });

    it("Should reject submission with empty name", async function () {
      const playerName = "";
      const score = 1000;

      await expect(
        frameBreaker.connect(player1).submitScore(playerName, score, {
          value: submissionFee
        })
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should reject submission with name too long", async function () {
      const playerName = "ThisNameIsTooLongForTheContract";
      const score = 1000;

      await expect(
        frameBreaker.connect(player1).submitScore(playerName, score, {
          value: submissionFee
        })
      ).to.be.revertedWith("Name too long");
    });



    it("Should reject submission when paused", async function () {
      // Pause the contract
      await frameBreaker.connect(owner).setPaused(true);

      const playerName = "Player1";
      const score = 1000;

      await expect(
        frameBreaker.connect(player1).submitScore(playerName, score, {
          value: submissionFee
        })
      ).to.be.revertedWith("Contract is paused");
    });

    it("Should refund excess fee", async function () {
      const playerName = "Player1";
      const score = 1000;
      const excessFee = ethers.parseEther("0.002");

      const initialBalance = await ethers.provider.getBalance(player1.address);

      await frameBreaker.connect(player1).submitScore(playerName, score, {
        value: excessFee
      });

      const finalBalance = await ethers.provider.getBalance(player1.address);
      const expectedRefund = excessFee - submissionFee;

      // Account for gas costs (approximate)
      expect(finalBalance).to.be.gt(initialBalance - excessFee + expectedRefund - ethers.parseEther("0.01"));
    });
  });

  describe("Score Retrieval", function () {
    beforeEach(async function () {
      // Submit multiple scores
      await frameBreaker.connect(player1).submitScore("Player1", 1000, {
        value: submissionFee
      });
      await frameBreaker.connect(player2).submitScore("Player2", 2000, {
        value: submissionFee
      });
      await frameBreaker.connect(player3).submitScore("Player3", 1500, {
        value: submissionFee
      });
    });

    it("Should get top scores in correct order", async function () {
      const topScores = await frameBreaker.getTopScores(3);

      expect(topScores.length).to.equal(3);
      expect(topScores[0].score).to.equal(2000n); // Player2
      expect(topScores[1].score).to.equal(1500n); // Player3
      expect(topScores[2].score).to.equal(1000n); // Player1
    });

    it("Should get player scores", async function () {
      const playerScores = await frameBreaker.getPlayerScores(player1.address);

      expect(playerScores.length).to.equal(1);
      expect(playerScores[0].playerName).to.equal("Player1");
      expect(playerScores[0].score).to.equal(1000n);
    });

    it("Should get specific score by index", async function () {
      const score = await frameBreaker.getScore(0);

      expect(score.playerName).to.equal("Player1");
      expect(score.score).to.equal(1000n);
      expect(score.player).to.equal(player1.address);
    });

    it("Should reject getting score with invalid index", async function () {
      await expect(frameBreaker.getScore(10)).to.be.revertedWith("Score does not exist");
    });

    it("Should reject getting top scores with invalid count", async function () {
      await expect(frameBreaker.getTopScores(0)).to.be.revertedWith("Invalid count");
      await expect(frameBreaker.getTopScores(10)).to.be.revertedWith("Invalid count");
    });
  });

  describe("Contract Statistics", function () {
    it("Should return correct stats", async function () {
      const [totalSubmissions, fee, balance] = await frameBreaker.getStats();

      expect(totalSubmissions).to.equal(0n);
      expect(fee).to.equal(submissionFee);
      expect(balance).to.equal(0n);
    });

    it("Should update stats after submission", async function () {
      await frameBreaker.connect(player1).submitScore("Player1", 1000, {
        value: submissionFee
      });

      const [totalSubmissions, fee, balance] = await frameBreaker.getStats();

      expect(totalSubmissions).to.equal(1n);
      expect(fee).to.equal(submissionFee);
      expect(balance).to.equal(submissionFee);
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to update submission fee", async function () {
      const newFee = ethers.parseEther("0.002");
      await frameBreaker.connect(owner).updateSubmissionFee(newFee);

      expect(await frameBreaker.submissionFee()).to.equal(newFee);
    });

    it("Should reject non-owner from updating submission fee", async function () {
      const newFee = ethers.parseEther("0.002");

      await expect(
        frameBreaker.connect(player1).updateSubmissionFee(newFee)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should allow owner to withdraw fees", async function () {
      // Submit a score to add funds
      await frameBreaker.connect(player1).submitScore("Player1", 1000, {
        value: submissionFee
      });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      await frameBreaker.connect(owner).withdrawFees(submissionFee);
      const finalBalance = await ethers.provider.getBalance(owner.address);

      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should reject non-owner from withdrawing fees", async function () {
      await expect(
        frameBreaker.connect(player1).withdrawFees(submissionFee)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should reject withdrawing more than available balance", async function () {
      await expect(
        frameBreaker.connect(owner).withdrawFees(ethers.parseEther("1"))
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should allow owner to transfer ownership", async function () {
      await frameBreaker.connect(owner).transferOwnership(player1.address);

      expect(await frameBreaker.owner()).to.equal(player1.address);
    });

    it("Should reject non-owner from transferring ownership", async function () {
      await expect(
        frameBreaker.connect(player1).transferOwnership(player2.address)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should reject transferring ownership to zero address", async function () {
      await expect(
        frameBreaker.connect(owner).transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid new owner");
    });

    it("Should allow owner to pause/unpause contract", async function () {
      await frameBreaker.connect(owner).setPaused(true);
      expect(await frameBreaker.paused()).to.equal(true);

      await frameBreaker.connect(owner).setPaused(false);
      expect(await frameBreaker.paused()).to.equal(false);
    });

    it("Should reject non-owner from pausing contract", async function () {
      await expect(
        frameBreaker.connect(player1).setPaused(true)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("Multiple Submissions", function () {
    it("Should handle multiple submissions from same player", async function () {
      await frameBreaker.connect(player1).submitScore("Player1", 1000, {
        value: submissionFee
      });
      await frameBreaker.connect(player1).submitScore("Player1", 2000, {
        value: submissionFee
      });

      const playerScores = await frameBreaker.getPlayerScores(player1.address);
      expect(playerScores.length).to.equal(2);

      expect(await frameBreaker.totalSubmissions()).to.equal(2n);
    });

    it("Should maintain correct order in top scores with multiple submissions", async function () {
      await frameBreaker.connect(player1).submitScore("Player1", 1000, {
        value: submissionFee
      });
      await frameBreaker.connect(player1).submitScore("Player1", 3000, {
        value: submissionFee
      });
      await frameBreaker.connect(player2).submitScore("Player2", 2000, {
        value: submissionFee
      });

      const topScores = await frameBreaker.getTopScores(3);

      expect(topScores[0].score).to.equal(3000n); // Player1's second score
      expect(topScores[1].score).to.equal(2000n); // Player2
      expect(topScores[2].score).to.equal(1000n); // Player1's first score
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum name length", async function () {
      const maxName = "1234567890"; // Exactly 10 characters
      const score = 1000;

      await frameBreaker.connect(player1).submitScore(maxName, score, {
        value: submissionFee
      });

      const submittedScore = await frameBreaker.getScore(0);
      expect(submittedScore.playerName).to.equal(maxName);
    });

    it("Should handle zero score", async function () {
      const playerName = "Player1";
      const score = 0;

      await frameBreaker.connect(player1).submitScore(playerName, score, {
        value: submissionFee
      });

      const submittedScore = await frameBreaker.getScore(0);
      expect(submittedScore.score).to.equal(0n);
    });

    it("Should handle very large scores", async function () {
      const playerName = "Player1";
      const score = ethers.MaxUint256;

      await frameBreaker.connect(player1).submitScore(playerName, score, {
        value: submissionFee
      });

      const submittedScore = await frameBreaker.getScore(0);
      expect(submittedScore.score).to.equal(score);
    });
  });

  describe("Receive Function", function () {
    it("Should accept ETH payments", async function () {
      const amount = ethers.parseEther("0.1");

      await player1.sendTransaction({
        to: await frameBreaker.getAddress(),
        value: amount
      });

      const balance = await ethers.provider.getBalance(await frameBreaker.getAddress());
      expect(balance).to.equal(amount);
    });
  });
});

// Helper function to get current timestamp
async function time() {
  const blockNum = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNum);
  return block.timestamp;
}
