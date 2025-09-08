const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying FrameBreaker contract...");

  // Get the contract factory
  const FrameBreaker = await hre.ethers.getContractFactory("FrameBreaker");
  
  // Set submission fee to 0.001 ETH (in wei)
  const submissionFee = hre.ethers.parseEther("0.001");
  
  console.log(`📝 Submission fee set to: ${hre.ethers.formatEther(submissionFee)} ETH`);
  
  // Deploy the contract
  const frameBreaker = await FrameBreaker.deploy(submissionFee);
  
  // Wait for deployment to complete
  await frameBreaker.waitForDeployment();
  
  const address = await frameBreaker.getAddress();
  
  console.log("✅ FrameBreaker deployed successfully!");
  console.log(`📍 Contract address: ${address}`);
  console.log(`🔗 BaseScan URL: https://basescan.org/address/${address}`);
  
  // Verify the contract on BaseScan
  console.log("\n🔍 Verifying contract on BaseScan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [submissionFee],
    });
    console.log("✅ Contract verified on BaseScan!");
  } catch (error) {
    console.log("⚠️  Contract verification failed:", error.message);
  }
  
  console.log("\n🎯 Next steps:");
  console.log("1. Update CONTRACT_ADDRESS in src/App.tsx");
  console.log("2. Test wallet connection and score submission");
  console.log("3. Deploy the Mini App to your hosting service");
  
  return address;
}

// Handle errors
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
