'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@alephium/web3-react';

interface WalletConnectionContextType {
  isConnected: boolean;
  isLoading: boolean;
  account: string | undefined;
}

const WalletConnectionContext = createContext<WalletConnectionContextType>({
  isConnected: false,
  isLoading: true,
  account: undefined
});

export function WalletConnectionProvider({ children }: { children: React.ReactNode }) {
  const { connectionStatus, account } = useWallet();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize connection state from localStorage if available
    const storedConnection = localStorage.getItem('walletConnection');
    if (storedConnection) {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Update localStorage when connection status changes
    if (connectionStatus !== 'connecting') {
      localStorage.setItem('walletConnection', JSON.stringify({
        isConnected: connectionStatus === 'connected',
        account
      }));
      setIsLoading(false);
    }
  }, [connectionStatus, account]);

  const value = {
    isConnected: connectionStatus === 'connected',
    isLoading,
    account
  };

  return (
    <WalletConnectionContext.Provider value={value}>
      {children}
    </WalletConnectionContext.Provider>
  );
}

export function useWalletConnection() {
  const context = useContext(WalletConnectionContext);
  if (context === undefined) {
    throw new Error('useWalletConnection must be used within a WalletConnectionProvider');
  }
  return context;
} 