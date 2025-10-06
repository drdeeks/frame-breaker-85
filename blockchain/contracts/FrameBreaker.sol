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
 */
contract FrameBreaker is Ownable, Pausable, ReentrancyGuard {
    struct Score {
        string playerName;
        uint256 score;
        uint256 timestamp;
        address player;
    }

    // Events
    event ScoreSubmitted(
        address indexed player,
        string playerName,
        uint256 score,
        uint256 timestamp
    );
    event SubmissionFeeUpdated(uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);
    event ContractUpgraded(address indexed newContract);

    // State variables
    uint256 public submissionFee; // defaults to 0
    uint256 public totalSubmissions;
    Score[] private leaderboard; // sorted array (descending by score)

    // Constants
    uint256 public constant MIN_SCORE = 0;
    uint256 public constant MAX_NAME_LENGTH = 10;
    uint256 public constant MAX_LEADERBOARD_SIZE = 100; // Cap leaderboard size

    /**
     * @dev Constructor - sets up the contract and transfers ownership to the deployer.
     * @param _initialOwner The address of the initial owner.
     * @param _initialSubmissionFee Fee required to submit a score (in wei).
     */
    constructor(
        address _initialOwner,
        uint256 _initialSubmissionFee
    ) Ownable(_initialOwner) {
        submissionFee = _initialSubmissionFee;
    }

    // --- Modifiers ---
    modifier validScore(uint256 _score) {
        require(_score >= MIN_SCORE, "Score must be non-negative");
        _;
    }

    modifier validName(string calldata _name) {
        require(
            bytes(_name).length > 0 && bytes(_name).length <= MAX_NAME_LENGTH,
            "Invalid name length"
        );
        _;
    }

    modifier hasSubmissionFee() {
        require(msg.value >= submissionFee, "Insufficient submission fee");
        _;
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
    )
        external
        payable
        whenNotPaused
        nonReentrant
        validScore(_score)
        validName(_playerName)
        hasSubmissionFee
    {
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
            require(success, "FrameBreaker: Refund failed");
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
        require(balance > 0, "No fees to withdraw");
        (bool sent, ) = _to.call{value: balance}("");
        require(sent, "Withdraw failed");
        emit FeesWithdrawn(_to, balance);
    }

    /**
     * @dev Emits an event indicating a contract upgrade. This function is for signaling
     *      off-chain systems about a new contract address, not for on-chain proxy upgrades.
     * @param _newContract The address of the new contract.
     */
    function upgradeContract(address _newContract) external onlyOwner {
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
        require(_topN > 0, "Must request at least 1 score");
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

    // Fallback function to accept ETH payments
    receive() external payable {}
}
