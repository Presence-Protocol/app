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
      <>
      {/* {account?.address} */}


      {connectionStatus === 'connected' && (
        <NFTList 
          account={account?.address}
        />
      )} 
      </>
      <Footer />
    </LandingLayout>
  )
}
