'use client';

import { useState } from 'react';
import Image from 'next/image';
import MainLogo from '@/images/logos/logo.png';


import { AlephiumConnectButton, AlephiumConnectButtonCustom } from '@alephium/web3-react'

function CustomWalletConnectButton() {
  return (
    <AlephiumConnectButton.Custom>
      {({ isConnected, disconnect, show, account }) => {
        return isConnected ? (
          <button
            className="text-black ml-4 mr-6 items-center shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white w-full sm:w-auto py-2 rounded-lg h-14 focus:translate-y-1 hover:text-lila-800 tracing-wide"
            onClick={disconnect}
          >
            Disconnect
          </button>
        ) : (
          <button
            className="text-black ml-4 mr-6 items-center shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white w-full sm:w-auto py-2 rounded-lg h-14 focus:translate-y-1 hover:text-lila-800 tracing-wide"
            onClick={show}
          >
            Connect Wallet
          </button>
        )
      }}
    </AlephiumConnectButton.Custom>
  )
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  

  return (
    <div
      // className="mx-auto w-full bg-lila-500 2xl:border-2 justify-center sticky top-0 py-1 md:py-3 z-20 border-b-2 border-black">
              className="mx-auto w-full bg-lila-500 justify-center sticky top-0 py-1 md:py-3 z-20 border-b-2 border-black">

      <div
        className="mx-auto w-full flex flex-col lg:flex-row py-2 md:py-0 lg:items-center lg:justify-between px-4 md:px-0">
        <div className="text-black items-center flex justify-between flex-row">
          <a
            className="items-center font-bold gap-2 inline-flex sm:px-3 md:px-6 text-lg md:text-xl  tracking-tighter"
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
          </a>
          <button
            className="focus:outline-none focus:shadow-outline md:hidden ml-auto border-2 border-black bg-red-500"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="h-8 w-8"
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
        <nav
          className={`flex-col items-center flex-grow ${isOpen ? 'flex' : 'hidden'} md:flex text-black text-base font-medium tracking-wide md:flex-row md:justify-end md:mt-0 gap-4 lg:p-0 py-2 md:py-0 md:px-0 md:pb-0 px-3 mt-4 md:mt-0`}
        >
                    <a
            className="duration-300 focus:text-orange/90 hover:text-lila-900 px-4 py-2 transform transition font-semibold"
            title="link to your page"
            aria-label="your label"
            href="/how-it-works"
          >
            How it works
          </a>
          <a
            className="duration-300 focus:text-orange/90 hover:text-lila-900 px-4 py-2 transform transition font-semibold"
            title="link to your page"
            aria-label="your label"
            href="/explorer"
          >
            Explorer
          </a>


          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="duration-300 focus:text-orange/90 hover:text-lila-900 px-4 py-2 transform transition inline-flex items-center gap-3 font-semibold"
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
          </div>

            <CustomWalletConnectButton />

          {/* <a
            className="text-black ml-4 mr-6 items-center shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white w-full sm:w-auto py-2 rounded-lg h-14 focus:translate-y-1 hover:text-lila-800 tracing-wide"
            href="/mint"
            title="link to your page"
            aria-label="your label"
          >
            Connect Wallet 
   
          </a> */}
                   {/* <span className="ml-3">&rarr;</span> */}
        </nav>
      </div>
    </div>
  );
}
