'use client'

import LandingLayout from "@/layouts/LandingLayout";
import Navigation from "@/components/global/Navigation";
import NewMint from "@/components/forms/NewMint";

export default function Mint() {
  return (
    <LandingLayout>
      <Navigation />
      <NewMint />
    </LandingLayout>
  )
}
