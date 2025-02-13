'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import MainLogo from '@/images/logos/logo.png';
import Link from 'next/link';

import { AlephiumConnectButton, AlephiumConnectButtonCustom } from '@alephium/web3-react'
import { useWallet } from '@alephium/web3-react';
import { useWalletLoading } from '@/context/WalletLoadingContext';
import { useTheme,  } from 'next-themes'

const buttonClasses = "text-foreground items-center shadow shadow-foreground text-base font-semibold inline-flex px-6 h-[50px] focus:outline-none justify-center text-center bg-background border-foreground ease-in-out transform transition-all focus:ring-accent focus:shadow-none border-2 duration-100 focus:bg-foreground focus:text-background w-full sm:w-auto py-2 rounded-lg h-14 focus:translate-y-1 hover:text-accent tracing-wide"
const loadingClasses = "opacity-50 transition-opacity duration-200"


function CustomWalletConnectButton() {
  const { account, connectionStatus } = useWallet()
  const { isWalletLoading, setIsWalletLoading } = useWalletLoading()


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsWalletLoading(false)
    }
  }, [])

  return (
    <AlephiumConnectButton.Custom>
      {({ isConnected, disconnect, show }) => {
        const showLoading = isWalletLoading ||
          connectionStatus === 'connecting' ||
          // @ts-ignore - We need this check even though types don't overlap
          connectionStatus === 'loading'

        // @ts-ignore - We need this check even though types don't overlap
        if (connectionStatus === 'loading') {
          return null
        }

        return isConnected ? (
          // null
          <button
            className={`${buttonClasses} ${showLoading ? loadingClasses : ''}`}
            onClick={disconnect}
            disabled={showLoading}
          >
            {showLoading ? 'Loading...' : 'Disconnect'}
          </button>
        ) : (
          <button
            className={`${buttonClasses} ${showLoading ? loadingClasses : ''}`}
            onClick={show}
            disabled={showLoading}
          >
            {showLoading ? 'Loading...' : 'Connect Wallet'}
          </button>
        )
      }}
    </AlephiumConnectButton.Custom>
  )
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { account, connectionStatus } = useWallet()
  const { isWalletLoading } = useWalletLoading()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTheme('light')
  }, [])

  const isConnected = connectionStatus === 'connected'

  // const toggleTheme = () => {
  //   console.log('Current theme:', theme)
  //   setTheme(theme === 'light' ? 'dark' : 'light')
  // }

  return (
    <>
    <div className="mx-auto w-full bg-primary dark:bg-background justify-center fixed top-0 py-1 lg:py-3.5 z-20 border-b-2 border-foreground">
      <div className="mx-auto w-full flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 lg:px-0">
        <div className="text-foreground items-center flex justify-between flex-row py-2 lg:py-0">
          <Link
            className="items-center font-bold gap-2 inline-flex sm:px-3 lg:px-6 text-lg lg:text-xl tracking-tighter"
            title="link to your page"
            aria-label="your label"
            href="/"
          >
            <Image
              src={MainLogo}
              alt="Presence Protocol"
              className="max-h-8 w-auto"
            />
            PRESENCE PROTOCOL
          </Link>
          <button
            className="focus:outline-none focus:shadow-outline lg:hidden ml-auto border-2 border-foreground bg-background p-2 rounded"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                className={isOpen ? 'hidden' : 'inline-flex'}
                d="M4 6h16M4 12h16M4 18h16"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                className={!isOpen ? 'hidden' : 'inline-flex'}
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
        <nav className={`${isOpen ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row items-center justify-center lg:justify-end text-foreground text-base font-medium tracking-wide gap-4 py-4 lg:py-0`}>
          {/* {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary/20 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              )}
            </button>
          )} */}
          <Link
            className="duration-300 hover:text-accent px-3 py-2 transform transition font-semibold h-[50px] flex items-center justify-center"
            href="/events"
          >
            Explore Events
          </Link>

          <div className='mr-1'>
            <Link
              href={isConnected ? '/new-event' : '#'}
              className={`duration-300 hover:text-accent px-3 py-2 transform transition font-semibold h-[50px] flex items-center justify-center ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={e => !isConnected && e.preventDefault()}
            >
              New Event
            </Link>
          </div>

          <Link
            className={`duration-300 hover:text-accent px-3 py-2 transform transition font-semibold h-[50px] flex items-center justify-center ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
            href={isConnected ? '/my-presence' : '#'}
            onClick={e => !isConnected && e.preventDefault()}
          >
            {!isConnected && (
              <span className="mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 inline-block align-text-top">
                  <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            My Presence
          </Link>

          <div className="flex items-center justify-center w-full lg:w-auto lg:mr-8">
            <div className="flex-shrink-0 h-[50px]">
              <CustomWalletConnectButton />
            </div>
          </div>
        </nav>
      </div>
    </div>
    <div className='h-[70px] bg-transparent z-0'></div>
    </>
  );
}
