'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WalletLoadingContextType {
  isWalletLoading: boolean;
  setIsWalletLoading: (loading: boolean) => void;
}

const WalletLoadingContext = createContext<WalletLoadingContextType | undefined>(undefined);

export function WalletLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isWalletLoading, setIsWalletLoading] = useState(true);

  useEffect(() => {
    // Check if we have a stored connection state
    const storedState = localStorage.getItem('walletLoading');
    if (storedState) {
      setIsWalletLoading(JSON.parse(storedState));
    } else {
      setIsWalletLoading(false);
    }
  }, []);

  // Persist loading state changes
  useEffect(() => {
    localStorage.setItem('walletLoading', JSON.stringify(isWalletLoading));
  }, [isWalletLoading]);

  return (
    <WalletLoadingContext.Provider value={{ isWalletLoading, setIsWalletLoading }}>
      {children}
    </WalletLoadingContext.Provider>
  );
}

export function useWalletLoading() {
  const context = useContext(WalletLoadingContext);
  if (context === undefined) {
    throw new Error('useWalletLoading must be used within a WalletLoadingProvider');
  }
  return context;
} 