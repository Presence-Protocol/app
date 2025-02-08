'use client'

import LandingLayout from "@/layouts/LandingLayout";
import Navigation from "@/components/global/Navigation";
import Timeline from "@/components/timelines/Timeline";
import HeroTwo from "@/components/heros/HeroTwo";
import TestimonialTwo from "@/components/testimonials/TestimonialTwo";
import EventsSliders from "@/components/events/EventsSliders";
import EventsHeader from "@/components/events/EventsHeader";
import Footer from "@/components/global/Footer";  
export default function Events() {
  return (
    <LandingLayout>
      <Navigation />
      <EventsSliders />
      <Footer />
    </LandingLayout>
  )
}

