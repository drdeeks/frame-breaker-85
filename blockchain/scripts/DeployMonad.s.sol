// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/FrameBreaker.sol";

contract DeployMonad is Script {
    function run() external returns (address deployedContract) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY"); // Or use keystore
        address initialOwner = vm.addr(deployerPrivateKey);
        uint256 initialSubmissionFee = 0.001 ether; // Example fee for Monad

        vm.startBroadcast(deployerPrivateKey);

        FrameBreaker fb = new FrameBreaker(initialOwner, initialSubmissionFee);

        vm.stopBroadcast();

        deployedContract = address(fb);
        console.log("FrameBreaker deployed to Monad:", deployedContract);

        // Automatic verification (requires ETHERSCAN_API_KEY for Monad)
        // vm.verify(
        //     deployedContract,
        //     "constructor(address,uint256)",
        //     abi.encode(initialOwner, initialSubmissionFee),
        //     vm.envString("MONADSCAN_API_KEY") // Assuming MONADSCAN_API_KEY env var
        // );
    }
}
