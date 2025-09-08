// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FrameBreaker
 * @dev Smart contract for Frame Breaker '85 game high score submissions on Base chain
 * @author Frame Breaker Team
 */
contract FrameBreaker {
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
    event ContractUpgraded(address indexed newContract);

    // State variables
    address public owner;
    uint256 public submissionFee;
    uint256 public totalSubmissions;
    mapping(uint256 => Score) public scores;
    mapping(address => uint256[]) public playerScores;

    // Constants
    uint256 public constant MAX_SCORES = 1000;
    uint256 public constant MIN_SCORE = 0;
    uint256 public constant MAX_NAME_LENGTH = 10;

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier validScore(uint256 _score) {
        require(_score >= MIN_SCORE, "Score must be non-negative");
        _;
    }

    modifier validName(string memory _name) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_name).length <= MAX_NAME_LENGTH, "Name too long");
        _;
    }

    modifier hasSubmissionFee() {
        require(msg.value >= submissionFee, "Insufficient submission fee");
        _;
    }

    /**
     * @dev Constructor - sets up the contract
     * @param _submissionFee Fee required to submit a score (in wei)
     */
    constructor(uint256 _submissionFee) {
        owner = msg.sender;
        submissionFee = _submissionFee;
        totalSubmissions = 0;
    }

    /**
     * @dev Get top scores (sorted by score, highest first)
     * @param _count Number of top scores to return
     * @return Array of top scores
     */
    function getTopScores(
        uint256 _count
    ) external view returns (Score[] memory) {
        require(_count > 0 && _count <= totalSubmissions, "Invalid count");

        Score[] memory topScores = new Score[](_count);
        uint256[] memory scoreIndices = new uint256[](totalSubmissions);

        // Create array of indices
        for (uint256 i = 0; i < totalSubmissions; i++) {
            scoreIndices[i] = i;
        }

        // Sort indices by score (bubble sort for simplicity)
        for (uint256 i = 0; i < totalSubmissions - 1; i++) {
            for (uint256 j = 0; j < totalSubmissions - i - 1; j++) {
                if (
                    scores[scoreIndices[j]].score <
                    scores[scoreIndices[j + 1]].score
                ) {
                    uint256 temp = scoreIndices[j];
                    scoreIndices[j] = scoreIndices[j + 1];
                    scoreIndices[j + 1] = temp;
                }
            }
        }

        // Get top scores
        for (uint256 i = 0; i < _count; i++) {
            topScores[i] = scores[scoreIndices[i]];
        }

        return topScores;
    }

    /**
     * @dev Get scores for a specific player
     * @param _player Address of the player
     * @return Array of player's scores
     */
    function getPlayerScores(
        address _player
    ) external view returns (Score[] memory) {
        uint256[] memory playerScoreIndices = playerScores[_player];
        Score[] memory playerScoreList = new Score[](playerScoreIndices.length);

        for (uint256 i = 0; i < playerScoreIndices.length; i++) {
            playerScoreList[i] = scores[playerScoreIndices[i]];
        }

        return playerScoreList;
    }

    /**
     * @dev Get a specific score by index
     * @param _index Index of the score
     * @return Score struct
     */
    function getScore(uint256 _index) external view returns (Score memory) {
        require(_index < totalSubmissions, "Score does not exist");
        return scores[_index];
    }

    /**
     * @dev Get contract statistics
     * @return _totalSubmissions Total number of submissions
     * @return _submissionFee Current submission fee
     * @return _contractBalance Current contract balance
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
     * @dev Update submission fee (owner only)
     * @param _newFee New submission fee in wei
     */
    function updateSubmissionFee(uint256 _newFee) external onlyOwner {
        submissionFee = _newFee;
    }

    /**
     * @dev Withdraw accumulated fees (owner only)
     * @param _amount Amount to withdraw in wei
     */
    function withdrawFees(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        payable(owner).transfer(_amount);
    }

    /**
     * @dev Transfer ownership (owner only)
     * @param _newOwner Address of new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid new owner");
        owner = _newOwner;
    }

    /**
     * @dev Emergency pause function (owner only)
     * This allows the owner to pause submissions if needed
     */
    bool public paused;

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    // Override submitScore to include pause check
    function submitScore(
        string memory _playerName,
        uint256 _score
    )
        external
        payable
        validScore(_score)
        validName(_playerName)
        hasSubmissionFee
        whenNotPaused
    {
        // Implementation remains the same
        Score memory newScore = Score({
            playerName: _playerName,
            score: _score,
            timestamp: block.timestamp,
            player: msg.sender
        });

        scores[totalSubmissions] = newScore;
        playerScores[msg.sender].push(totalSubmissions);
        totalSubmissions++;

        emit ScoreSubmitted(msg.sender, _playerName, _score, block.timestamp);

        if (msg.value > submissionFee) {
            payable(msg.sender).transfer(msg.value - submissionFee);
        }
    }

    // Fallback function
    receive() external payable {
        // Accept ETH payments
    }
}
