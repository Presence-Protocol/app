'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import MainLogo from '@/images/logos/logo.png';
import Link from 'next/link';

import { AlephiumConnectButton, AlephiumConnectButtonCustom } from '@alephium/web3-react'
import { useWallet } from '@alephium/web3-react';
import { useWalletLoading } from '@/context/WalletLoadingContext';

const buttonClasses = "text-black items-center shadow shadow-black text-base font-semibold inline-flex px-6 h-[50px] focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white w-full sm:w-auto py-2 rounded-lg h-14 focus:translate-y-1 hover:text-lila-800 tracing-wide"
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

  const isConnected = connectionStatus === 'connected'

  return (
    <div className="mx-auto w-full bg-lila-500 justify-center sticky top-0 py-1 lg:py-3.5 z-20 border-b-2 border-black">
      <div className="mx-auto w-full flex flex-col lg:flex-row py-2 lg:py-0 lg:items-center lg:justify-between px-4 lg:px-0">
        <div className="text-black items-center flex justify-between flex-row">
          <Link
            className="items-center font-bold gap-2 inline-flex sm:px-3 lg:px-6 text-lg lg:text-xl  tracking-tighter"
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
            className="focus:outline-none focus:shadow-outline lg:hidden ml-auto border-2 border-black bg-white"
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
        <nav className={`flex-col items-center flex-grow ${isOpen ? 'flex' : 'hidden'} lg:flex text-black text-base font-medium tracking-wide lg:flex-row lg:justify-end lg:mt-0 gap-4 lg:p-0 py-2 lg:py-0 lg:px-0 lg:pb-0 px-2 mt-4 lg:mt-0`}>
          {/* <Link
            className="duration-300 focus:text-orange/90 hover:text-lila-900 px-3 py-2 transform transition font-semibold"
            href="/how-it-works"
          >
            How it works
          </Link> */}


          {/* <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="duration-300 focus:text-orange/90 hover:text-lila-900 px-3 py-2 transform transition inline-flex items-center gap-3 font-semibold"
            >
              <span>Learn</span>
              <svg
                className={`inline h-4 transition-transform duration-200 transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'} icon icon-tabler icon-tabler-chevron-down`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  stroke="none"
                  d="M0 0h24v24H0z"
                  fill="none"
                />
                <path d="M6 9l6 6l6 -6" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div
                className="absolute min-w-48 right-0 z-10 w-auto mt-2 origin-top-right rounded-lg bg-white ring-2 ring-black focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
                tabIndex={-1}
              >
                <div
                  className="py-3 px-2 bg-white rounded-xl"
                  role="none"
                >
                     <a
                    title="link to your page"
                    aria-label="your label"
                    href="/components/colors"
                    className="block text-left px-4 py-2 text-sm text-black hover:text-lila-800 w-full font-semibold"
                    role="menuitem"
                    tabIndex={-1}
                    id="menu-item-2"
                  >
                    Save Memories
                  </a>
                  <a
                    title="link to your page"
                    aria-label="your label"
                    href="/components/typography"
                    className="block text-left px-4 py-2 text-sm text-black hover:text-lila-800 w-full font-semibold"
                    role="menuitem"
                    tabIndex={-1}
                    id="menu-item-0"
                  >
                    Create Events
                  </a>
                  <a
                    title="link to your page"
                    aria-label="your label"
                    href="/components/colors"
                    className="block text-left px-4 py-2 text-sm text-black hover:text-lila-800 w-full font-semibold"
                    role="menuitem"
                    tabIndex={-1}
                    id="menu-item-2"
                  >
                    Track Attendees
                  </a>
                </div>
              </div>
            )}
          </div> */}

          <Link
            className={`duration-300 focus:text-orange/90 hover:text-lila-900 px-3 py-2 transform transition font-semibold ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
            href={isConnected ? '/explorer' : '#'}
            onClick={e => !isConnected && e.preventDefault()}
          >
            Explorer
          </Link>

          <div className='mr-1'>
            <Link
              href={isConnected ? '/new-collection' : '#'}
              className={`duration-300 focus:text-orange/90 hover:text-lila-900 px-3 py-2 transform transition font-semibold ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={e => !isConnected && e.preventDefault()}
            >
              New Collection
            </Link>
          </div>

          <Link
            className={`duration-300 focus:text-orange/90 hover:text-lila-900 px-3 py-2 transform transition font-semibold ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
            href={isConnected ? '/my-presence' : '#'}
            onClick={e => !isConnected && e.preventDefault()}
          >
            {!isConnected && (
              <span className="mr-1" style={{ marginBottom: '-2px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 inline-block align-text-top">
                  <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            My Presence
          </Link>

          <div className="flex items-center gap-4 w-full lg:w-auto mr-8">
            <div className=''>
              <div className=" flex-shrink-0 h-[50px]">
                <CustomWalletConnectButton />
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
