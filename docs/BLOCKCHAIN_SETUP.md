# 🔗 Base Chain Integration Setup

## Overview

Frame Breaker '85 now supports blockchain-based high score submissions on Base chain! Users can pay a small gas fee to permanently record their scores on the blockchain.

## 🏗️ Smart Contract

### Contract Features

- **Score Submission**: Players pay gas fees to submit scores
- **Permanent Storage**: All scores are stored on Base chain
- **Leaderboard**: View top scores from the blockchain
- **Player History**: Track individual player scores
- **Fee Management**: Configurable submission fees
- **Emergency Controls**: Pause functionality for maintenance

### Contract Address

```
CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" // Replace with deployed address
```

## 🚀 Deployment Instructions

### 1. Prerequisites

- Node.js 22.11.0+
- Base chain ETH for gas fees
- Hardhat or Foundry for deployment

### 2. Install Dependencies

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install ethers
```

### 3. Hardhat Configuration

Create `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.19",
  networks: {
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 8453,
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 84532,
    }
  }
};
```

### 4. Deploy Contract

```bash
# Set your private key
export PRIVATE_KEY="your_private_key_here"

# Deploy to Base Sepolia (testnet)
npx hardhat run scripts/deploy.js --network baseSepolia

# Deploy to Base mainnet
npx hardhat run scripts/deploy.js --network base
```

### 5. Update Contract Address

After deployment, update the contract address in `src/App.tsx`:

```typescript
const CONTRACT_ADDRESS = '0x...'; // Your deployed contract address
```

## 💰 Gas Fee Structure

### Current Fees (Base Chain)

- **Gas Price**: ~0.001 gwei (very low!)
- **Submission Fee**: 0.001 ETH (~$0.01-0.05)
- **Total Cost**: ~$0.01-0.05 per submission

### Fee Configuration

The contract owner can update submission fees:

```solidity
function updateSubmissionFee(uint256 _newFee) external onlyOwner
```

## 🔧 Integration Features

### Wallet Connection

- Automatic wallet detection via Farcaster SDK
- Support for MetaMask, WalletConnect, and other wallets
- Automatic Base network switching

### Score Submission Flow

1. **Game Over**: Player reaches game over screen
2. **Wallet Check**: App checks if wallet is connected
3. **Network Switch**: Automatically switches to Base network
4. **Gas Estimation**: Estimates gas fees for transaction
5. **Transaction**: Submits score with gas fee
6. **Confirmation**: Waits for transaction confirmation
7. **Update UI**: Shows transaction hash and updates leaderboard

### Error Handling

- **Wallet Not Connected**: Fallback to local storage
- **Network Issues**: Automatic network switching
- **Insufficient Funds**: Clear error messages
- **Transaction Failures**: Graceful fallback

## 📊 Contract Functions

### Public Functions

```solidity
// Submit a score (payable)
function submitScore(string memory _playerName, uint256 _score) external payable

// Get top scores
function getTopScores(uint256 _count) external view returns (Score[] memory)

// Get player scores
function getPlayerScores(address _player) external view returns (Score[] memory)

// Get contract stats
function getStats() external view returns (uint256, uint256, uint256)
```

### Owner Functions

```solidity
// Update submission fee
function updateSubmissionFee(uint256 _newFee) external onlyOwner

// Withdraw fees
function withdrawFees(uint256 _amount) external onlyOwner

// Pause contract
function setPaused(bool _paused) external onlyOwner
```

## 🎮 User Experience

### Game Over Screen

- **Wallet Status**: Shows connection status
- **Connect Button**: Easy wallet connection
- **Submit Options**:
  - "Submit to Base Chain (Gas Fee)" - Blockchain submission
  - "Save Locally" - Local storage fallback
- **Fee Information**: Clear cost display
- **Transaction Status**: Real-time submission progress

### Leaderboard

- **Blockchain Badge**: Shows which scores are on-chain
- **Transaction Links**: Direct links to BaseScan
- **Hybrid Display**: Shows both local and blockchain scores

## 🔍 Verification

### Contract Verification

```bash
# Verify on BaseScan
npx hardhat verify --network base CONTRACT_ADDRESS "0.001000000000000000"
```

### Testing

```bash
# Run tests
npx hardhat test

# Test on Base Sepolia
npx hardhat run scripts/test-deployment.js --network baseSepolia
```

## 📈 Analytics

### Contract Events

```solidity
event ScoreSubmitted(address indexed player, string playerName, uint256 score, uint256 timestamp);
```

### Monitoring

- Track submissions on BaseScan
- Monitor gas usage and costs
- Analyze player engagement

## 🛡️ Security

### Contract Security

- **Access Control**: Owner-only functions
- **Input Validation**: Score and name validation
- **Emergency Pause**: Ability to pause submissions
- **Fee Management**: Secure fee collection and withdrawal

### User Security

- **No Private Keys**: Uses wallet connection only
- **Gas Estimation**: Accurate fee estimation
- **Transaction Confirmation**: Clear success/failure feedback
- **Fallback Options**: Local storage if blockchain fails

## 🚨 Troubleshooting

### Common Issues

**Wallet Connection Fails**

- Check if wallet extension is installed
- Ensure wallet is unlocked
- Try refreshing the page

**Network Switch Fails**

- Manually add Base network to wallet
- Check network configuration
- Verify RPC URL

**Transaction Fails**

- Check wallet balance for gas fees
- Verify Base network is selected
- Check contract address is correct

**High Gas Fees**

- Base chain typically has very low fees
- Check current network congestion
- Consider using Base Sepolia for testing

## 📚 Resources

- [Base Chain Documentation](https://docs.base.org/)
- [BaseScan Explorer](https://basescan.org/)
- [Base Bridge](https://bridge.base.org/)
- [Farcaster Wallet Integration](https://miniapps.farcaster.xyz/docs/guides/wallets)

## 🎯 Next Steps

1. **Deploy Contract**: Deploy to Base Sepolia for testing
2. **Update Address**: Update contract address in code
3. **Test Integration**: Test wallet connection and submission
4. **Deploy to Mainnet**: Deploy to Base mainnet
5. **Monitor Usage**: Track submissions and gas usage
6. **Optimize Fees**: Adjust submission fees based on usage

---

**Ready to break frames on the blockchain! 🎮🔗**
