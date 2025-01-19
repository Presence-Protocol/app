'use client'

import React from 'react'
import { TokenDapp } from '@/components/TokenDapp'
import { AlephiumConnectButton, useWallet } from '@alephium/web3-react'
import { tokenFaucetConfig } from '@/services/utils'
import Navigation from '@/components/global/Navigation'
import LandingLayout from "@/layouts/LandingLayout"
import HeroOne from "@/components/heros/HeroOne"
import LogoCloudOne from "@/components/testimonials/LogoCloudOne"
import FeatureSix from "@/components/features/FeatureSix"
import FeatureEight from "@/components/features/FeatureEight"
import CtaOne from "@/components/ctas/CtaOne"
import FaqOne from "@/components/faqs/FaqOne"
import Footer from "@/components/global/Footer"

export default function Home() {
  const { connectionStatus } = useWallet()

  return (
    <LandingLayout>
      <Navigation />
      {/* <AlephiumConnectButton /> */}
      {/* {connectionStatus === 'connected' && (
        <TokenDapp config={tokenFaucetConfig} />
      )} */}
      <HeroOne />
      <LogoCloudOne/>
      <FeatureSix />
      <FeatureEight />
      <CtaOne />
      <FaqOne />
      <Footer />
    </LandingLayout>
  )
}
