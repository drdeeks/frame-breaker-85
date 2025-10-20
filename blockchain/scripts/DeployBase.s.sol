// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../contracts/FrameBreaker.sol";

contract DeployBase is Script {
    uint256 constant MAX_LEADERBOARD_SIZE = 10;

    function run() external returns (address deployedContract) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory etherscanApiKey = vm.envString("BASESCAN_API_KEY");

        if (deployerPrivateKey == 0) {
            console.log("Error: PRIVATE_KEY environment variable not set.");
            return address(0);
        }

        if (bytes(etherscanApiKey).length == 0) {
            console.log("Error: BASESCAN_API_KEY environment variable not set.");
            return address(0);
        }

        uint256 initialSubmissionFee = 0.0001 ether;

        vm.startBroadcast(deployerPrivateKey);

        FrameBreaker fb = new FrameBreaker(initialSubmissionFee, MAX_LEADERBOARD_SIZE);

        vm.stopBroadcast();

        deployedContract = address(fb);
        console.log("FrameBreaker deployed to Base:", deployedContract);

        // Verify the contract on BaseScan
        console.log("Verifying contract on BaseScan...");
        vm.verifyContract(deployedContract, "FrameBreaker", abi.encode(initialSubmissionFee, MAX_LEADERBOARD_SIZE));
        console.log("Contract verification submitted.");

        return deployedContract;
    }
}