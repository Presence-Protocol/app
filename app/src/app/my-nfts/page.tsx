'use client'

import LandingLayout from "@/layouts/LandingLayout";
import Navigation from "@/components/global/Navigation";
import NewMint from "@/components/forms/NewMint";
import NFTList from "@/components/nfts/NFTList";

export default function Mint() {
  return (
    <LandingLayout>
      <Navigation />
      <NFTList />
    </LandingLayout>
  )
}

