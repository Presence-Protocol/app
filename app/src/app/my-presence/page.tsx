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

  return (
    <LandingLayout>
      <Navigation />
      <div className="bg-lila-200 max-w-7xl mx-auto">

      


      {connectionStatus !== 'connected' ? (
        <section className="py-36 px-4 md:px-8 bg-lila-200">
          <div className="mx-auto max-w-7xl">
            <div className="bg-lila-200 p-8 rounded-xl">
              <div className="max-w-lg mx-auto text-center">
                <Image
                  src="/images/blob5.svg"
                  alt="No presences"
                  width={60}
                  height={60}
                  className="mx-auto mb-6 opacity-80"
                  priority
                />
                <h3 className="text-2xl font-semibold text-black mb-4">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-600 mb-8">
                  To view your collected Presences and event memories, please connect your wallet.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => window.open('https://docs.alephium.org/wallet/', '_blank')}
                    className="text-black items-center shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-lila-400 border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 py-3 rounded-lg h-12 focus:translate-y-1 hover:text-lila-800 tracking-wide"
                  >
                    Learn About Wallets
                  </button>
                  <AlephiumConnectButton.Custom>
                    {({ show }) => (
                      <button
                        onClick={show}
                        className="text-black items-center shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 py-3 rounded-lg h-12 focus:translate-y-1 hover:text-lila-800 tracking-wide"
                      >
                        Connect Wallet <span className="ml-3">&rarr;</span>
                      </button>
                    )}
                  </AlephiumConnectButton.Custom>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <NFTList 
          account={account?.address}
        />
      )}
      </div>
      <Footer />
    </LandingLayout>
  )
}
