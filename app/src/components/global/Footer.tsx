'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { useWallet } from '@alephium/web3-react';
import { AlephiumConnectButton } from '@alephium/web3-react';
import { useWalletLoading } from '@/context/WalletLoadingContext';
import Image from 'next/image';
import TelegramQRCode from '@/images/social/telegram.jpeg';
const buttonClasses = "text-black items-center shadow shadow-lila-600 text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-lila-300 focus:bg-lila-600 border-lila-600 duration-300 outline-none focus:shadow-none border-2 sm:w-auto py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:bg-lila-500"
const loadingClasses = "opacity-50 transition-opacity duration-200"

function CustomWalletConnectButton() {
  const { connectionStatus } = useWallet()
  const { isWalletLoading } = useWalletLoading()

  return (
    <AlephiumConnectButton.Custom>
      {({ show }) => {
        const showLoading = isWalletLoading ||
          connectionStatus === 'connecting' ||
          // @ts-ignore
          connectionStatus === 'loading'

        return (
          <button
            className={`${buttonClasses} ${showLoading ? loadingClasses : ''}`}
            onClick={show}
            disabled={showLoading}
          >
            {showLoading ? 'Loading...' : 'Work with us'} <span className="ml-3">&rarr;</span>
          </button>
        )
      }}
    </AlephiumConnectButton.Custom>
  )
}

function CustomGetStartedButton() {
  const { connectionStatus } = useWallet()
  const { isWalletLoading } = useWalletLoading()

  return (
    <AlephiumConnectButton.Custom>
      {({ show }) => {
        const showLoading = isWalletLoading ||
          connectionStatus === 'connecting' ||
          // @ts-ignore
          connectionStatus === 'loading'

        return (
          <button
            className="hover:text-lila-500 text-left"
            onClick={show}
            disabled={showLoading}
          >
            {showLoading ? 'Loading...' : 'Get Started'}
          </button>
        )
      }}
    </AlephiumConnectButton.Custom>
  )
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { connectionStatus } = useWallet()
  const isConnected = connectionStatus === 'connected'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter an email address');
      return;
    }

    try {
      // Add your form submission logic here
      // console.log('Form submitted with email:', email);
      setEmail('');
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <footer className="overflow-hidden">
      <div
        className="p-8 lg:p-20 pb-0 lg:pb-0  mx-auto bg-black border-b border-black">
        <div className="h-full space-y-12 lg:space-y-0 pb-12 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-32 items-start">
            <div className="flex flex-col gap-6 lg:col-span-2 max-w-xl">
              <div>
                <h3
                  className="text-3xl md:text-4xl text-white lg:text-5xl font-medium tracking-tight">
                  Your Presence, Forever on the Blockchain.
                </h3>



                {/* <div className="mt-6">
                  {isConnected ? (
                    <Link
                      className={buttonClasses}
                      href="/new-event"
                      aria-label="Explore all pages"
                    >
                      Work with us <span className="ml-3">&rarr;</span>
                    </Link>
                  ) : (
                    <CustomWalletConnectButton />
                  )}
                </div> */}

              </div>
              <div
                className="flex flex-col gap-6"
                x-data="{ year: new Date().getFullYear() }">
                <p className="text-white text-xl font-normal tracking-wide">
                  Presence Protocol <span>
                    © Copyright <span x-text="year"></span>. All rights reserved.</span
                  >
                </p>
                <div className="flex gap-4">
                  <a
                    title="Presence X account"
                    aria-label="Presence X account"
                    target='_blank'
                    rel="noopener noreferrer"
                    href="https://twitter.com/PresenceProto"
                    className="flex h-10 w-10 items-center justify-center hover:shadow-none hover:border-white border-2 border-black shadow-tiny duration-300 shadow-white hover:translate-x-1 hover:translate-y-1 rounded-full bg-white  ">
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-brand-x size-4"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
                        <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
                      </svg>
                    </div>
                  </a>
                  <a
                    title="Alephium website"
                    aria-label="Alephium website"
                    target='_blank'
                    rel="noopener noreferrer"
                    href="https://alephium.org/"
                    className="flex h-10 w-10 items-center justify-center hover:shadow-none hover:border-white border-2 border-black shadow-tiny duration-300 shadow-white hover:translate-x-1 hover:translate-y-1 rounded-full bg-white  ">
                    <div>
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 1000 1000"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        xmlSpace="preserve"
                        style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}
                        className="size-6"
                      >
                        <g transform="matrix(1,0,0,1,-3372,0)">
                          <g transform="matrix(0.714286,0,0,0.4876,2336.29,0)">
                            <rect x="1450" y="0" width="1400" height="2050.86" style={{ fill: 'none' }}/>
                            <g transform="matrix(2.15145,0,0,3.06273,1741.93,-13470.9)">
                              <g transform="matrix(0.46324,0,0,0.476693,59.5258,4506.4)">
                                <path d="M187.296,627.61C187.296,615.272 177.581,606.969 165.616,609.078L21.68,634.454C9.715,636.564 -0,648.293 -0,660.63L-0,932.485C-0,944.822 9.715,953.126 21.68,951.016L165.616,925.64C177.581,923.531 187.296,911.802 187.296,899.464L187.296,627.61Z" style={{ fillRule: 'nonzero' }}/>
                              </g>
                              <g transform="matrix(0.46324,0,0,0.476693,59.5258,4506.4)">
                                <path d="M561.888,18.859C561.888,6.522 552.173,-1.782 540.207,0.327L396.272,25.704C384.306,27.813 374.592,39.542 374.592,51.88L374.592,323.734C374.592,336.072 384.306,344.375 396.272,342.266L540.207,316.89C552.173,314.78 561.888,303.051 561.888,290.714L561.888,18.859Z" style={{ fillRule: 'nonzero' }}/>
                              </g>
                              <g transform="matrix(0.46324,0,0,0.476693,59.5258,4506.4)">
                                <path d="M210.743,82.363C205.186,70.124 190.266,62.023 177.446,64.283L23.229,91.472C10.408,93.732 4.512,105.503 10.069,117.742L351.145,868.949C356.702,881.188 371.622,889.29 384.442,887.029L538.659,859.841C551.479,857.581 557.376,845.809 551.819,833.57L210.743,82.363Z" style={{ fillRule: 'nonzero' }}/>
                              </g>
                            </g>
                          </g>
                        </g>
                      </svg>
                    </div>
                  </a>
                  <a
                    title="Github repository"
                    aria-label="Github repository"
                    target='_blank'
                    rel="noopener noreferrer"
                    href="https://github.com/Presence-Protocol"
                    className="flex h-10 w-10 items-center justify-center hover:shadow-none hover:border-white border-2 border-black shadow-tiny duration-300 shadow-white hover:translate-x-1 hover:translate-y-1 rounded-full bg-white  ">
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-brand-github-filled size-4"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
                        <path
                          d="M5.315 2.1c.791 -.113 1.9 .145 3.333 .966l.272 .161l.16 .1l.397 -.083a13.3 13.3 0 0 1 4.59 -.08l.456 .08l.396 .083l.161 -.1c1.385 -.84 2.487 -1.17 3.322 -1.148l.164 .008l.147 .017l.076 .014l.05 .011l.144 .047a1 1 0 0 1 .53 .514a5.2 5.2 0 0 1 .397 2.91l-.047 .267l-.046 .196l.123 .163c.574 .795 .93 1.728 1.03 2.707l.023 .295l.007 .272c0 3.855 -1.659 5.883 -4.644 6.68l-.245 .061l-.132 .029l.014 .161l.008 .157l.004 .365l-.002 .213l-.003 3.834a1 1 0 0 1 -.883 .993l-.117 .007h-6a1 1 0 0 1 -.993 -.883l-.007 -.117v-.734c-1.818 .26 -3.03 -.424 -4.11 -1.878l-.535 -.766c-.28 -.396 -.455 -.579 -.589 -.644l-.048 -.019a1 1 0 0 1 .564 -1.918c.642 .188 1.074 .568 1.57 1.239l.538 .769c.76 1.079 1.36 1.459 2.609 1.191l.001 -.678l-.018 -.168a5.03 5.03 0 0 1 -.021 -.824l.017 -.185l.019 -.12l-.108 -.024c-2.976 -.71 -4.703 -2.573 -4.875 -6.139l-.01 -.31l-.004 -.292a5.6 5.6 0 0 1 .908 -3.051l.152 -.222l.122 -.163l-.045 -.196a5.2 5.2 0 0 1 .145 -2.642l.1 -.282l.106 -.253a1 1 0 0 1 .529 -.514l.144 -.047l.154 -.03z"
                          strokeWidth="0"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </div>
                  </a>
                </div>



                <a 
                  href="https://t.me/+gTNus1GdkRM4MTE0" target='_blank'
                  className="mt-6 w-fit bg-white p-1 rounded-lg shadow block transition-transform duration-300 hover:scale-110"
                >
                  <Image
                    src={TelegramQRCode}
                    alt="Join our Telegram"
                    width={72}
                    height={72}
                    className="rounded"
                  />
                </a>
              </div>
            </div>
            <nav
              className="grid grid-cols-1 gap-x-12 gap-y-4 text-left  justify-between text-base tracking-wide items-center text-white"
              role="navigation">
              {isConnected ? (
                <Link
                  className="hover:text-lila-500 text-left"
                  href="/new-event"
                  aria-label="Get Started"
                >
                  Get Started
                </Link>
              ) : (
                <CustomGetStartedButton />
              )}
              <a
                className="hover:text-lila-500"
                title="link to your page"
                aria-label="your label"
                target='_blank'
                rel="noopener noreferrer"
                href="https://github.com/Presence-Protocol/app"
              >Documentation</a
              >

              <a
                className="hover:text-lila-500"
                title="link to your page"
                aria-label="your label"
                target='_blank'
                rel="noopener noreferrer"
                href="https://twitter.com/PresenceProto"
              >Contact Us</a
              >
            </nav>
          </div>
        </div>

      </div>
    </footer>
  )
}
