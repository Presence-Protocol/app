'use client'

import LandingLayout from "@/layouts/LandingLayout";
import Navigation from "@/components/global/Navigation";
import NFTList from "@/components/nfts/NFTList";
import { useWallet } from "@alephium/web3-react";
import Footer from "@/components/global/Footer";

export default function Mint() {
  const { account, connectionStatus } = useWallet()

  return (
    <LandingLayout>
      <Navigation />
      <div className="bg-lila-200 max-w-7xl mx-auto">

      


      {connectionStatus !== 'connected' ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 py-48 bg-lila-200">
          <div className="bg-white p-6 rounded-xl border-2 border-black shadow-large text-center max-w-md">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="aspect-square rounded-lg absolute inset-0" />
              <img
                src="/images/blob4.svg"
                alt="Connect Wallet"
                className="absolute inset-0 w-full h-full object-cover rounded-lg animate-pulse"
              />
            </div>
            <h2 className="text-2xl font-semibold text-black mb-3">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              To view your collected POAPs and event memories, please connect your wallet using the button in the navigation bar above.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-lila-800 cursor-pointer" onClick={() => window.open('https://docs.alephium.org/wallet/', '_blank')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lila-800 cursor-pointer">New to Web3? Learn more about wallets</span>
            </div>
          </div>
        </div>
      ) : (
        <NFTList 
          account={account?.address}
        />
      )} 
      </div>
      <Footer />
    </LandingLayout>
  )
}
