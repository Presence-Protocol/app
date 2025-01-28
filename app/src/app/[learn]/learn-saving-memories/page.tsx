
import LandingLayout from "@/layouts/LandingLayout";
import Navigation from "@/components/global/Navigation";
import NFTList from "@/components/nfts/NFTList";

// Add static paths generation
export async function generateStaticParams() {
  return [
    {
      learn: 'learn-create-events',
    },
  ]
}

export default function Mint() {
  return (
    <LandingLayout>
      <Navigation />
      <NFTList account={""} />
    </LandingLayout>
  )
}

