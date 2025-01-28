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

function getStoredWalletState() {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('walletConnection');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function WalletConnectionProvider({ children }: { children: React.ReactNode }) {
  const { connectionStatus, account } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [persistentConnection, setPersistentConnection] = useState(() => {
    const stored = getStoredWalletState();
    return {
      isConnected: stored?.isConnected || false,
      account: stored?.account || undefined
    };
  });

  // Update persistent state when wallet status changes
  useEffect(() => {
    if (connectionStatus === 'connected' && account) {
      setPersistentConnection({ isConnected: true, account });
      localStorage.setItem('walletConnection', JSON.stringify({
        isConnected: true,
        account
      }));
    } else if (connectionStatus === 'disconnected') {
      setPersistentConnection({ isConnected: false, account: undefined });
      localStorage.setItem('walletConnection', JSON.stringify({
        isConnected: false,
        account: undefined
      }));
    }
    setIsLoading(false);
  }, [connectionStatus, account]);

  const value = {
    // Use persistent connection state first, then fall back to current state
    isConnected: connectionStatus === 'connecting' ? persistentConnection.isConnected : connectionStatus === 'connected',
    isLoading: isLoading && connectionStatus === 'connecting',
    account: persistentConnection.account
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