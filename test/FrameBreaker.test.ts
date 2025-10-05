import { expect } from "chai";
import { ethers } from "hardhat";
import { FrameBreaker } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("FrameBreaker", function () {
  let frameBreaker: FrameBreaker;
  let owner: SignerWithAddress;
  let player: SignerWithAddress;
  let otherPlayers: SignerWithAddress[];
  const submissionFee = ethers.parseEther("0.01");

  beforeEach(async function () {
    [owner, player, ...otherPlayers] = await ethers.getSigners();

    const FrameBreaker = await ethers.getContractFactory("FrameBreaker");
    frameBreaker = await FrameBreaker.deploy(owner.address, submissionFee);
    await frameBreaker.waitForDeployment();
  });

  describe("Score Submission", function () {
    it("should allow submitting a score with correct fee", async function () {
      await frameBreaker.connect(player).submitScore("Alice", 500, {
        value: submissionFee
      });

      const leaderboard = await frameBreaker.getLeaderboard(1);
      expect(leaderboard.length).to.equal(1);
      expect(leaderboard[0].score).to.equal(500);
      expect(leaderboard[0].player).to.equal(player.address);
    });

    it("should revert with insufficient fee", async function () {
      const lowFee = ethers.parseEther("0.005");

      await expect(
        frameBreaker.connect(player).submitScore("Bob", 100, {
          value: lowFee
        })
      ).to.be.revertedWith("Insufficient submission fee");
    });

    it("should refund excess fee", async function () {
      const excessAmount = ethers.parseEther("0.005");
      const totalSent = submissionFee + excessAmount;

      const initialBalance = await ethers.provider.getBalance(player.address);

      const tx = await frameBreaker.connect(player).submitScore("Charlie", 700, {
        value: totalSent
      });

      // Wait for the transaction
      await tx.wait();

      const finalBalance = await ethers.provider.getBalance(player.address);
      const gasUsed = (await tx.wait())!.gasUsed;
      const gasPrice = tx.gasPrice;
      const gasCost = gasUsed * gasPrice!;

      // Player should have their initial balance minus submission fee and gas costs
      expect(finalBalance).to.equal(
        initialBalance - submissionFee - gasCost
      );
    });
  });

  // Add more test suites here...
});