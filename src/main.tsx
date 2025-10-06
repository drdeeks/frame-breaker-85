// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// --- Wagmi and multi-chain support ---
import { WagmiConfig, createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

// Define custom chain for Monad Testnet
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
    default: { name: 'Monadscan', url: 'https://testnet.monadscan.xyz' },
  },
  testnet: true,
};

// Create wagmi config with the http transport
const config = createConfig({
  chains: [base, baseSepolia, monadTestnet],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [monadTestnet.id]: http(),
  },
  ssr: true, // Enable SSR for Farcaster Mini App compatibility
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <App />
    </WagmiConfig>
  </React.StrictMode>,
);