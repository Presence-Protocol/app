'use client'

import LandingLayout from "@/layouts/LandingLayout";
import Navigation from "@/components/global/Navigation";
import Footer from "@/components/global/Footer";
import SeriesDetail from "@/components/series/SeriesDetail";

export default function SeriesPage() {
  return (
    <LandingLayout>
      <Navigation />
      <SeriesDetail />
      <Footer />
    </LandingLayout>
  )
}
