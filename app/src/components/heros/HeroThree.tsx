'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@alephium/web3-react';
import { AlephiumConnectButton } from '@alephium/web3-react';
import { useWalletLoading } from '@/context/WalletLoadingContext';
import Link from 'next/link';
import Image from 'next/image';
import PizzaImage from '../../../public/illustrations/pizza.png'

// Update button styles to use theme colors
const buttonClasses = "text-foreground items-center shadow shadow-foreground text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-background border-foreground ease-in-out transform transition-all focus:ring-accent focus:shadow-none border-2 duration-100 focus:text-background sm:w-auto py-3 rounded-lg h-16 focus:translate-y-1 w-full hover:text-accent tracing-wide"
const loadingClasses = "opacity-50 transition-opacity duration-200"

function CustomWalletConnectButton() {
  const { connectionStatus } = useWallet()
  const { isWalletLoading, setIsWalletLoading } = useWalletLoading()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsWalletLoading(false)
    }
  }, [])

  return (
    <AlephiumConnectButton.Custom>
      {({ isConnected, show }) => {
        const showLoading = isWalletLoading ||
          connectionStatus === 'connecting' ||
          // @ts-ignore - We need this check even though types don't overlap
          connectionStatus === 'loading'

        return (
          <button
            className={`${buttonClasses} ${showLoading ? loadingClasses : ''}`}
            onClick={show}
            disabled={showLoading}
          >
            {showLoading ? 'Loading...' : 'Get started'} <span className="ml-3">&rarr;</span>
          </button>
        )
      }}
    </AlephiumConnectButton.Custom>
  )
}

export default function HeroThree() {
  const [isSpread, setIsSpread] = useState(false);
  const { connectionStatus } = useWallet()
  const isConnected = connectionStatus === 'connected'

  useEffect(() => {
    // Single timer for the spread animation
    const spreadTimer = setTimeout(() => {
      setIsSpread(true);
    }, 100); // Start spreading almost immediately

    return () => clearTimeout(spreadTimer);
  }, []);

  const cards = [
    {
      title: 'Presence Pizza Meetup',
      description: 'Redeem your presence for pizza!',
      image: '/images/blob7.svg',
    },
    {
      title: 'Alephium Dev Meetup',
      description: 'Join our monthly blockchain workshop!',
      image: '/images/blob4.svg',
    },
    {
      title: 'Presence Launch Party',
      description: 'Celebrate our mainnet deployment!',
      image: '/images/blob1.svg',
    },
    {
      title: 'Web3 Gaming Night',
      description: 'Play and earn your presence token!',
      image: '/images/blob2.svg',
    },
    {
      title: 'DeFi Conference 2024',
      description: 'Network with Alephium builders!',
      image: '/images/blob3.svg',
    },
  ];

  return (
    <div className="bg-lila-300 dark:bg-slate-900 ">
      <main>
        <div className="relative isolate">
          <div className="overflow-hidden">
            <div className="mx-auto max-w-8xl px-6 sm:px-8 md:px-12 lg:px-20 pb-12 pt-24 sm:pt-16 lg:pt-6">
              <div className="mx-auto max-w-2xl gap-x-8 lg:mx-0 lg:flex lg:max-w-none lg:items-center justify-evenly">
                <div className="relative w-full lg:max-w-xl lg:shrink-0 xl:max-w-2xl">
                  <h2 className="text-pretty text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground">
                    Proof You Were There.<br/> 
                    {/* Powered by Alephium */}
                  </h2>
                  <p className="mt-8 text-pretty text-md lg:text-md font-medium text-foreground/80 sm:max-w-md sm:text-lg/7 lg:max-w-none">
                    Presence is a proof protocol made for everyday use. With Presence, anyone can leverage blockchain proofs for a wide variety of use-cases.
                  </p>
                  <div className="mt-10">
                    {isConnected ? (
                      <Link
                        className={buttonClasses}
                        href="/my-presence"
                      >
                        My Presence <span className="ml-3">&rarr;</span>
                      </Link>
                    ) : (
                      <CustomWalletConnectButton />
                    )}
                  </div>
                </div>

                <div className="relative h-[400px] sm:h-[500px] lg:h-[700px] w-full sm:w-[500px] lg:w-[700px] perspective-1000 mt-8 lg:mt-0">
                  <div className="cards-container">
                    {cards.map((card, index) => (
                      <div
                        key={index}
                        className="card-wrapper absolute left-1/2 top-[20%] -translate-x-1/2 -translate-y-1/2 transition-all duration-[1000ms] ease-in-out"
                        style={{
                          transform: isSpread 
                            ? `translateX(${(index - 2) * (window.innerWidth < 640 ? 80 : 120)}px) 
                               translateY(${Math.abs(index - 2) * (window.innerWidth < 640 ? 10 : 15)}px)
                               rotateZ(${(index - 2) * (window.innerWidth < 640 ? 8 : 12)}deg)
                               rotateY(-5deg)
                               translateZ(${index * (window.innerWidth < 640 ? 15 : 20)}px)`
                            : `rotateY(-5deg) translateZ(${-index * 2}px)`,
                          opacity: 1,
                          zIndex: cards.length - index,
                        }}
                      >
                        <div 
                          className="bg-background p-3 rounded-xl border-2 border-foreground shadow-large group overflow-hidden w-[200px] sm:w-[250px] transition-colors duration-200"
                          style={{
                            position: 'relative',
                            zIndex: cards.length - index,
                          }}
                        >
                          <div className="relative h-auto">
                            <div className="aspect-square rounded-lg box-border border-2 border-foreground bg-lila-400 dark:bg-gradient-to-t dark:from-primary dark:to-secondary p-2 h-full transition-colors duration-200" />
                            <img
                              src={card.image}
                              alt="Feature blob"
                              className="absolute inset-0 w-32 h-32 m-auto object-cover rounded-lg"
                            />
                          </div>
                          <div className="h-[80px] flex flex-col justify-center">
                            <h3 className="font-medium text-sm lg:text-base text-foreground">{card.title}</h3>
                            <p className="text-xs text-foreground/60 lg:text-xs">{card.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
