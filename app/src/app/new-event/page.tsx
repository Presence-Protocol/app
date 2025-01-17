'use client'

import LandingLayout from "@/layouts/LandingLayout";
import Navigation from "@/components/global/Navigation";
import NewEvent from "@/components/forms/NewEvent";

export default function Mint() {
  return (
    <LandingLayout>
      <Navigation />
      <NewEvent />
    </LandingLayout>
  )
}

