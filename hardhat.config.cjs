require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const networks = {
  hardhat: {
    chainId: 31337,
  },
};

if (process.env.PRIVATE_KEY && /^[a-fA-F0-9]{64}$/.test(process.env.PRIVATE_KEY)) {
  networks.base = {
    url: "https://mainnet.base.org",
    accounts: [process.env.PRIVATE_KEY],
    chainId: 8453,
    gasPrice: 1000000000, // 1 gwei
  };
  networks.baseSepolia = {
    url: "https://sepolia.base.org",
    accounts: [process.env.PRIVATE_KEY],
    chainId: 84532,
    gasPrice: 1000000000, // 1 gwei
  };
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: networks,
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY || "",
      baseSepolia: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
    paths: {
    sources: "./blockchain/contracts",
    tests: "./blockchain/test",
    cache: "./blockchain/cache",
    artifacts: "./blockchain/artifacts",
    scripts: "./blockchain/scripts"
  },
};