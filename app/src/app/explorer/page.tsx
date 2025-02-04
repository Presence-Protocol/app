'use client'

import LandingLayout from "@/layouts/LandingLayout";
import Navigation from "@/components/global/Navigation";
import Timeline from "@/components/timelines/Timeline";
import HeroTwo from "@/components/heros/HeroTwo";
import TestimonialTwo from "@/components/testimonials/TestimonialTwo";
import ExplorerSearch from "@/components/explorer/ExplorerSearch";
import ExplorerSliders from "@/components/explorer/ExplorerSliders";
import ExplorerHeader from "@/components/explorer/ExplorerHeader";

export default function Mint() {
  return (
    <LandingLayout>
      <Navigation />
      {/* <ExplorerSearch /> */}
      {/* <ExplorerHeader /> */}
      <ExplorerSliders />
    </LandingLayout>
  )
}

