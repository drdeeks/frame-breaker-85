// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol"; // Import console for logging
import "../src/FrameBreaker.sol";

contract DeployBase is Script { // Renamed from DeployFrameBreaker to DeployBase
    function run() external returns (address deployedContract) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY"); // Or use keystore
        address initialOwner = vm.addr(deployerPrivateKey);
        uint256 initialSubmissionFee = 0.01 ether; // Example fee for Base

        vm.startBroadcast(deployerPrivateKey);

        FrameBreaker fb = new FrameBreaker(initialOwner, initialSubmissionFee);

        vm.stopBroadcast();

        deployedContract = address(fb);
        console.log("FrameBreaker deployed to Base:", deployedContract);

        // Automatic verification (requires ETHERSCAN_API_KEY for Base)
        // vm.verify(
        //     deployedContract,
        //     "constructor(address,uint256)",
        //     abi.encode(initialOwner, initialSubmissionFee),
        //     vm.envString("BASESCAN_API_KEY") // Assuming BASESCAN_API_KEY env var
        // );
    }
}

