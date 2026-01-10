'use client'

import LandingLayout from "@/layouts/LandingLayout";
import Navigation from "@/components/global/Navigation";
import NFTList from "@/components/nfts/NFTList";
import { useWallet } from "@alephium/web3-react";
import Footer from "@/components/global/Footer";
import Image from "next/image";
import { AlephiumConnectButton } from "@alephium/web3-react";

export default function Mint() {
  const { account, connectionStatus } = useWallet()

  // Debug logging
  console.log('My Presence Page - connectionStatus:', connectionStatus);
  console.log('My Presence Page - account:', account);
  console.log('My Presence Page - account?.address:', account?.address);

  // Show loading state while connecting
  if (connectionStatus === 'connecting') {
    return (
      <LandingLayout>
        <Navigation />
        <div className="bg-lila-200 max-w-7xl mx-auto">
          <section className="py-36 px-4 md:px-8 bg-lila-200">
            <div className="mx-auto max-w-7xl">
              <div className="bg-lila-200 p-8 rounded-xl">
                <div className="max-w-lg mx-auto text-center">
                  <div className="animate-spin mx-auto mb-6">
                    <Image
                      src="/images/blob5.svg"
                      alt="Loading"
                      width={60}
                      height={60}
                      className="opacity-80"
                      priority
                    />
                  </div>
                  <h3 className="text-2xl font-semibold text-black mb-4">
                    Connecting Wallet...
                  </h3>
                  <p className="text-gray-600">
                    Please wait while we connect to your wallet.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <Navigation />
      <div className="bg-lila-200 max-w-7xl mx-auto">

      


      {/* Test mode: use test address when wallet not connected */}
      <NFTList 
        account={account?.address || '1GBvuTs4TosNB9xTCGJL5wABn2xTYCzwa7MnXHphjcj1y'}
      />
      </div>
      <Footer />
    </LandingLayout>
  )
}
