/**
 * @fileoverview Custom hook for Farcaster Mini App SDK integration
 * @module hooks/useFarcasterSDK
 */

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface UseFarcasterSDKReturn {
  isReady: boolean;
  error: Error | null;
}

/**
 * Hook for initializing and managing Farcaster Mini App SDK
 */
export function useFarcasterSDK(): UseFarcasterSDKReturn {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Critical: Call ready() to hide splash screen and display content
        await sdk.actions.ready();
        setIsReady(true);
        console.log('Farcaster Mini App SDK initialized successfully');
      } catch (err) {
        console.error('Failed to initialize Farcaster Mini App SDK:', err);
        setError(err as Error);
        // Continue without SDK - app will still work in browser
        setIsReady(true);
      }
    };

    initializeSDK();
  }, []);

  return { isReady, error };
}
