'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter an email address');
      return;
    }

    try {
      // Add your form submission logic here
      console.log('Form submitted with email:', email);
      setEmail('');
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (



    <footer className="overflow-hidden">
      <div
        className="p-8 lg:p-20 pb-0 lg:pb-0  mx-auto bg-black border-b border-black">
        <div className="h-full space-y-12 lg:space-y-0 pb-12 lg:pb-48">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-32 items-start">
            <div className="flex flex-col gap-6 lg:col-span-2 max-w-xl">
              <div>
                <h3
                  className="text-3xl md:text-4xl text-white lg:text-5xl font-medium tracking-tight">
                  Subscribe, get tips to grow the way you deserve.
                </h3>
              
                <div className="mt-6">
              <Link
                className="text-black items-center shadow shadow-lila-600 text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-lila-300 focus:bg-lila-600 border-lila-600 duration-300 outline-none focus:shadow-none border-2 sm:w-auto py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:bg-lila-500"
                href="/new-event"
                aria-label="Explore all pages"
              >
                Get started <span className="ml-3">&rarr;</span>
              </Link>
            </div>


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
                    title="link to your page"
                    aria-label="your label"
                    href="#_"
                    className="flex h-10 w-10 items-center justify-center hover:shadow-none hover:border-white border-2 border-black shadow-tiny duration-300 shadow-white hover:translate-x-1 hover:translate-y-1 rounded-full bg-white focus:bg-black focus:text-white">
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
                    title="link to your page"
                    aria-label="your label"
                    href="#_"
                    className="flex h-10 w-10 items-center justify-center hover:shadow-none hover:border-white border-2 border-black shadow-tiny duration-300 shadow-white hover:translate-x-1 hover:translate-y-1 rounded-full bg-white focus:bg-black focus:text-white">
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-currency-bitcoin size-4"
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
                        <path d="M6 6h8a3 3 0 0 1 0 6a3 3 0 0 1 0 6h-8"></path>
                        <path d="M8 6l0 12"></path>
                        <path d="M8 12l6 0"></path>
                        <path d="M9 3l0 3"></path>
                        <path d="M13 3l0 3"></path>
                        <path d="M9 18l0 3"></path>
                        <path d="M13 18l0 3"></path>
                      </svg>
                    </div>
                  </a>
                  <a
                    title="link to your page"
                    aria-label="your label"
                    href="#_"
                    className="flex h-10 w-10 items-center justify-center hover:shadow-none hover:border-white border-2 border-black shadow-tiny duration-300 shadow-white hover:translate-x-1 hover:translate-y-1 rounded-full bg-white focus:bg-black focus:text-white">
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
              </div>
            </div>
            <nav
              className="grid grid-cols-1 gap-x-12 gap-y-4 l justify-between text-base tracking-wide items-center text-white"
              role="navigation">
              <a
                className="hover:text-lila-500"
                title="link to your page"
                aria-label="your label"
                href="/"
              >Get Started</a>
              <a
                className="hover:text-lila-500"
                title="link to your page"
                aria-label="your label"
                href="/documentation"
              >Documentation</a
              >
       
              <a
                className="hover:text-lila-500"
                title="link to your page"
                aria-label="your label"
                href="https://www.lexingtonthemes.com/documentation/quick-start"
              >Work with Us</a
              >
              <a
                className="hover:text-lila-500"
                title="link to your page"
                aria-label="your label"
                href="https://www.lexingtonthemes.com/legal/license"
              >Contact Us</a
              >
            </nav>
          </div>
        </div>
       
      </div>
    </footer>

  )
}
