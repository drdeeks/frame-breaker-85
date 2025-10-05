// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// --- Start of proposed changes for Wagmi and multi-chain support ---
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { base, baseSepolia } from 'wagmi/chains'; // Import Basechain and Base Sepolia (for example)

const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MONAD',
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monadscan', url: 'https://testnet.monadscan.xyz' }, // Placeholder URL
  },
  testnet: true,
};


// Configure chains and providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [base, baseSepolia, monadTestnet],
  [publicProvider()]
);

// Create wagmi config
const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
});
// --- End of proposed changes ---

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* --- Proposed change: Wrap App with WagmiConfig --- */}
    <WagmiConfig config={config}>
      <App />
    </WagmiConfig>
    {/* --- End of proposed change --- */}
  </React.StrictMode>,
);