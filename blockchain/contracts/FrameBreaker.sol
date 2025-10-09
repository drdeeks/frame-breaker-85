// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FrameBreaker
 * @dev Unified, robust, and inclusive smart contract for Frame Breaker '85 game high score submissions.
 *      Combines features from previous iterations, including a dynamic, sorted leaderboard,
 *      pausable functionality, and upgradeability.
 * @author Frame Breaker Team (Enhanced by AI)
 * @notice This contract manages a fixed-size leaderboard for a game.
 * @custom:version 1.1.0
 */
contract FrameBreaker is Ownable, Pausable, ReentrancyGuard {
    // --- Custom Errors ---
    error InvalidScore(uint256 score);
    error InvalidName(string name);
    error InsufficientFee(uint256 required, uint256 sent);
    error NoFeesToWithdraw();
    error WithdrawFailed();
    error RefundFailed();
    error InvalidLeaderboardRequest(uint256 topN);
    error InvalidNewContractAddress(address addr);

    // --- Data Structures ---
    struct Score {
        string playerName;
        uint256 score;
        uint256 timestamp;
        address player;
    }

    // --- Events ---
    event ScoreSubmitted(
        address indexed player,
        string playerName,
        uint256 score,
        uint256 timestamp
    );
    event SubmissionFeeUpdated(uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);
    event ContractUpgraded(address indexed newContract);

    // --- State Variables ---
    uint256 public submissionFee;
    uint256 public totalSubmissions;
    Score[] private leaderboard; // Sorted array (descending by score)

    // --- Constants ---
    uint256 public constant MIN_SCORE = 0;
    uint256 public constant MAX_NAME_LENGTH = 16;
    uint256 public immutable MAX_LEADERBOARD_SIZE; // Gas-efficient immutable constant

    /**
     * @dev Constructor - sets up the contract. The deployer is automatically set as the owner.
     * @param _initialSubmissionFee Fee required to submit a score (in wei).
     * @param _maxLeaderboardSize The maximum number of entries in the leaderboard.
     */
    constructor(
        uint256 _initialSubmissionFee,
        uint256 _maxLeaderboardSize
    ) {
        submissionFee = _initialSubmissionFee;
        MAX_LEADERBOARD_SIZE = _maxLeaderboardSize;
    }

    // --- Core Functions ---

    /**
     * @dev Submits a new score to the leaderboard.
     * @param _playerName The player's name (max 10 characters).
     * @param _score The score achieved.
     */
    function submitScore(
        string calldata _playerName,
        uint256 _score
    ) external payable whenNotPaused nonReentrant {
        if (_score < MIN_SCORE) revert InvalidScore(_score);
        if (
            bytes(_playerName).length == 0 ||
            bytes(_playerName).length > MAX_NAME_LENGTH
        ) {
            revert InvalidName(_playerName);
        }
        if (msg.value < submissionFee) {
            revert InsufficientFee(submissionFee, msg.value);
        }

        Score memory newScore = Score({
            playerName: _playerName,
            score: _score,
            timestamp: block.timestamp,
            player: msg.sender
        });

        _insertScore(newScore);
        totalSubmissions++;

        emit ScoreSubmitted(msg.sender, _playerName, _score, block.timestamp);

        // Refund any excess fee sent
        uint256 excessFee = msg.value - submissionFee;
        if (excessFee > 0) {
            (bool success, ) = payable(msg.sender).call{value: excessFee}("");
            if (!success) revert RefundFailed();
        }
    }

    /**
     * @dev Inserts a score if it's high enough for the leaderboard.
     *      If the leaderboard is full, it replaces the lowest score.
     *      Maintains a sorted leaderboard (descending by score).
     *      This approach is significantly more gas-efficient for a fixed-size leaderboard.
     */
    function _insertScore(Score memory newScore) internal {
        // Only proceed if the score is high enough to be on the leaderboard
        if (
            leaderboard.length < MAX_LEADERBOARD_SIZE ||
            newScore.score > leaderboard[leaderboard.length - 1].score
        ) {
            if (leaderboard.length < MAX_LEADERBOARD_SIZE) {
                leaderboard.push(newScore);
            } else {
                // Replace the lowest score
                leaderboard[leaderboard.length - 1] = newScore;
            }

            // Sort the new score into its correct position (bubble-up)
            uint256 i = leaderboard.length - 1;
            while (i > 0 && leaderboard[i].score > leaderboard[i - 1].score) {
                Score memory temp = leaderboard[i - 1];
                leaderboard[i - 1] = leaderboard[i];
                leaderboard[i] = temp;
                i--;
            }
        }
    }

    // --- Admin Functions ---

    /**
     * @dev Pauses the contract, preventing new score submissions. (Owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract, allowing new score submissions. (Owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Updates the submission fee. (Owner only)
     * @param _newFee New submission fee in wei.
     */
    function setSubmissionFee(uint256 _newFee) external onlyOwner {
        submissionFee = _newFee;
        emit SubmissionFeeUpdated(_newFee);
    }

    /**
     * @dev Withdraws accumulated fees to a specified address. (Owner only)
     * @param _to The address to send the fees to.
     */
    function withdrawFees(address payable _to) external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoFeesToWithdraw();

        (bool sent, ) = _to.call{value: balance}("");
        if (!sent) revert WithdrawFailed();

        emit FeesWithdrawn(_to, balance);
    }

    /**
     * @dev Emits an event indicating a contract upgrade.
     * @notice This function is for signaling off-chain systems about a new contract address.
     *         It does NOT perform an on-chain upgrade (e.g., via a proxy).
     * @param _newContract The address of the new contract.
     */
    function upgradeContract(address _newContract) external onlyOwner {
        if (_newContract == address(0)) {
            revert InvalidNewContractAddress(_newContract);
        }
        emit ContractUpgraded(_newContract);
    }

    // --- View Functions ---

    /**
     * @dev Returns the top N scores from the leaderboard.
     * @param _topN The number of top scores to retrieve.
     * @return An array of Score structs.
     */
    function getLeaderboard(
        uint256 _topN
    ) external view returns (Score[] memory) {
        if (_topN == 0) revert InvalidLeaderboardRequest(_topN);

        uint256 n = _topN > leaderboard.length ? leaderboard.length : _topN;
        Score[] memory topScores = new Score[](n);
        for (uint256 i = 0; i < n; i++) {
            topScores[i] = leaderboard[i];
        }
        return topScores;
    }

    /**
     * @dev Returns the current size of the leaderboard.
     */
    function getLeaderboardSize() external view returns (uint256) {
        return leaderboard.length;
    }

    /**
     * @dev Get contract statistics.
     * @return _totalSubmissions Total number of submissions.
     * @return _submissionFee Current submission fee.
     * @return _contractBalance Current contract balance.
     */
    function getStats()
        external
        view
        returns (
            uint256 _totalSubmissions,
            uint256 _submissionFee,
            uint256 _contractBalance
        )
    {
        return (totalSubmissions, submissionFee, address(this).balance);
    }

    /**
     * @notice Returns the version of the contract.
     */
    function version() external pure returns (string memory) {
        return "1.1.0";
    }

    /**
     * @dev Fallback function to accept direct ETH payments, e.g., for donations.
     */
    receive() external payable {}
}
