'use client'

import LandingLayout from "@/layouts/LandingLayout";
import Navigation from "@/components/global/Navigation";
import TeamGrid from "@/components/team/TeamGrid";

export default function Mint() {
  const teamPosts = [
    {
        slug: "cgi",
        data: {
          name: "CGI",
          role: "Smart Contracts",
          avatar: {
            url: "/images/team/cgi.jpg"
          }
        }
      },
      {
        slug: "hux",
        data: {
          name: "HUX",
          role: "Creative / UX",
          avatar: {
            url: "/images/team/hux.jpg"
          }
        }
      },
      {
        slug: "foxhood",
        data: {
          name: "Foxhood & Push Value",
          role: "UI / UX",
          avatar: {
            url: "/images/team/foxhood.jpg"
          }
        }
      }
  ]

  return (
    <LandingLayout>
      <Navigation />
      <TeamGrid posts={teamPosts} />
    </LandingLayout>
  )
}

