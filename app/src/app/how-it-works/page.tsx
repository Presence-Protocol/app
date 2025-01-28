'use client'

import LandingLayout from "@/layouts/LandingLayout";
import Navigation from "@/components/global/Navigation";
import Timeline from "@/components/timelines/Timeline";

export default function Mint() {
  return (
    <LandingLayout>
      <Navigation />
      <Timeline />
    </LandingLayout>
  )
}

