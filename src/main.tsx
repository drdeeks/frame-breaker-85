import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// --- Wagmi and multi-chain support ---
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MiniAppProvider } from '@neynar/react';

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

import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { walletConnect } from 'wagmi/connectors';

// Create wagmi config with the http transport
const config = createConfig({
  chains: [base, monadTestnet],
  transports: {
    [base.id]: http(),
    [monadTestnet.id]: http(),
  },
  connectors: [
    farcasterMiniApp(),
    walletConnect({ projectId: '047cf03136ea16c3b1ddb82247808d58' }),
  ],
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MiniAppProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </WagmiProvider>
    </MiniAppProvider>
  </React.StrictMode>,
);