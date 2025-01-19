'use client'

import LandingLayout from "@/layouts/LandingLayout";
import Navigation from "@/components/global/Navigation";
import NFTList from "@/components/nfts/NFTList";
import { useWallet } from "@alephium/web3-react";

export default function Mint() {
  const { connectionStatus } = useWallet()
  return (
    <LandingLayout>
      <Navigation />
      <>
      {connectionStatus === 'connected' && (
        <NFTList />
      )} 
      </>
    </LandingLayout>
  )
}

