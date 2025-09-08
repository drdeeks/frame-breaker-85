# 🚀 Frame Breaker '85 - Complete Deployment Guide

## 📋 Overview

This guide will help you deploy both the Mini App and the smart contract for Frame Breaker '85.

## 🎮 Mini App Deployment

### 1. Build the Application
```bash
npm run build
```

### 2. Deploy to Hosting Service
Choose one of these options:

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Option C: GitHub Pages
```bash
# Add to package.json scripts
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

### 3. Update URLs
After deployment, update these files with your domain:
- `farcaster-miniapp.json`
- `.well-known/farcaster.json`
- `index.html` (meta tags)

## 🔗 Smart Contract Deployment

### 1. Setup Environment
```bash
# Copy environment file
cp env.example .env

# Run the setup script to configure your private key
node scripts/setup-private-key.cjs

# Or manually edit .env and add your private key
PRIVATE_KEY=your_wallet_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
```

### 2. Get Base Chain ETH
- **Testnet**: Get Base Sepolia ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- **Mainnet**: Bridge ETH from Ethereum to Base using [Base Bridge](https://bridge.base.org/)

### 3. Deploy Contract

#### Testnet (Recommended First)
```bash
npx hardhat run scripts/deploy.cjs --network baseSepolia
```

#### Mainnet
```bash
npx hardhat run scripts/deploy.cjs --network base
```

### 4. Update Contract Address
After deployment, update the contract address in `src/App.tsx`:
```typescript
const CONTRACT_ADDRESS = '0x...'; // Your deployed contract address
```

## 🧪 Testing

### 1. Test Mini App
```bash
npm run dev
```
Visit: `http://localhost:5173`

### 2. Test Smart Contract
```bash
# Compile contracts
npx hardhat compile

# Run tests (if you add them)
npx hardhat test

# Test on local network
npx hardhat node
npx hardhat run scripts/deploy.cjs --network localhost
```

## 📱 Farcaster Integration

### 1. Enable Developer Mode
1. Visit: https://farcaster.xyz/~/settings/developer-tools
2. Toggle "Developer Mode" on
3. Use desktop for best experience

### 2. Test Mini App
1. Open Farcaster
2. Navigate to Mini Apps
3. Find your app or use direct URL
4. Test wallet connection and score submission

## 🔧 Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Contract Deployment Fails**
- Check wallet has enough ETH for gas
- Verify private key is correct
- Ensure you're on the right network

**Wallet Connection Issues**
- Check if wallet extension is installed
- Ensure wallet is unlocked
- Try refreshing the page

**Network Switch Fails**
- Manually add Base network to wallet
- Check RPC URL configuration

## 📊 Monitoring

### Mini App
- Monitor usage in hosting service dashboard
- Check browser console for errors
- Test on different devices

### Smart Contract
- Monitor on [BaseScan](https://basescan.org/)
- Track gas usage and costs
- Monitor contract events

## 🎯 Success Checklist

- [ ] Mini App builds successfully
- [ ] Mini App deployed to hosting service
- [ ] URLs updated in manifest files
- [ ] Smart contract deployed to Base chain
- [ ] Contract address updated in code
- [ ] Wallet connection working
- [ ] Score submission working
- [ ] Tested in Farcaster Developer Mode
- [ ] All assets (images) uploaded

## 🚀 Next Steps

1. **Submit to Farcaster**: Use Developer Tools to submit for review
2. **Marketing**: Share your Mini App on social media
3. **Analytics**: Set up usage tracking
4. **Updates**: Plan future features and improvements

---

**🎮 Ready to break frames on the blockchain!**
