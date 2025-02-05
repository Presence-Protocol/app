'use client'

import LandingLayout from "@/layouts/LandingLayout";
import Navigation from "@/components/global/Navigation";
import MintNFT from "@/components/nfts/MintNFT";
import MintNFTSimple from '@/components/nfts/MintNFTSimple'
import MintNFTSimpleAlt from '@/components/nfts/MintNFTSimpleAlt'

export default function Mint() {
  return (
    <LandingLayout>
      <Navigation />
      <MintNFTSimple />
      {/* <MintNFTSimpleAlt /> */}
      {/* <MintNFT /> */}
    </LandingLayout>
  )
}
