// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../contracts/FrameBreaker.sol";

contract DeployMonad is Script {
    uint256 constant MAX_LEADERBOARD_SIZE = 10;

    function run() external returns (address deployedContract) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint256 initialSubmissionFee = 0.0001 ether;

        vm.startBroadcast(deployerPrivateKey);

        FrameBreaker fb = new FrameBreaker(initialSubmissionFee, MAX_LEADERBOARD_SIZE);

        vm.stopBroadcast();

        deployedContract = address(fb);
        console.log("FrameBreaker deployed to Monad:", deployedContract);
    }
}
