'use client'

import LandingLayout from "@/layouts/LandingLayout";
import Navigation from "@/components/global/Navigation";
import NewMint from "@/components/forms/NewMint";
import MintNFT from "@/components/nfts/MintNFT";

export default function Mint() {
  return (
    <LandingLayout>
      <Navigation />
      <MintNFT />
    </LandingLayout>
  )
}
