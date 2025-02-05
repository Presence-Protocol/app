'use client';

import { useState } from 'react';

export default function HeroThree() {
  return (
    <div className="bg-lila-300">
      <main>
        <div className="relative isolate">
          <div className="overflow-hidden">
            <div className="mx-auto max-w-8xl px-20 pb-12 pt-24 sm:pt-32 lg:px-20 lg:pt-12">
              <div className="mx-auto max-w-2xl gap-x-8 lg:mx-0 lg:flex lg:max-w-none lg:items-center justify-evenly">
                <div className="relative w-full lg:max-w-xl lg:shrink-0 xl:max-w-2xl">
                  <h2 className="text-pretty text-5xl font-semibold tracking-tight text-black sm:text-7xl">
                    Your Moments,<br/> Your Memories, <br/> Your Attendance; <i>Immortalized.</i>
                  </h2>
                  <p className="mt-8 text-pretty text-lg font-medium text-black sm:max-w-md sm:text-xl/8 lg:max-w-none">
                    With Presence Protocol, preserving and sharing life's moments has never been easier—or more meaningful.
                  </p>
                  <div className="mt-10">
                    <a
                      className="text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white sm:w-auto py-3 rounded-lg h-16 focus:translate-y-1 w-full hover:text-lila-800 tracing-wide"
                      href="/new-event"
                      title="link to your page"
                      aria-label="your label"
                    >
                      Get started <span className="ml-3">&rarr;</span>
                    </a>
                  </div>
                </div>

                <div className="mt-14 flex justify-end gap-6 sm:-mt-32 sm:justify-start sm:pl-12 lg:mt-0 lg:pl-0">
                  <div className="ml-auto w-52 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-64 lg:order-last lg:pt-32 xl:order-none xl:pt-64">
                    <div className="bg-white p-3 rounded-xl border-2 border-black shadow-large group overflow-hidden">
                      <div className="relative">
                        <div className="aspect-square rounded-lg bg-lila-300 mb-3" />
                        <img
                          src="/images/blob3.svg"
                          alt="Feature blob"
                          className="absolute inset-0 w-32 h-32 m-auto object-cover rounded-lg group-hover:animate-[sparkle_1s_ease-in-out]"
                        />
                      </div>
                      <h3 className="font-medium text-base">Create Events</h3>
                      <p className="text-xs text-gray-600">Host and manage your events</p>
                    </div>
                  </div>

                  <div className="mr-auto w-52 flex-none space-y-8 sm:mr-0 sm:pt-40 lg:pt-32">
                    <div className="bg-white p-3 rounded-xl border-2 border-black shadow-large group overflow-hidden">
                      <div className="relative">
                        <div className="aspect-square rounded-lg bg-lila-300 mb-3" />
                        <img
                          src="/images/blob4.svg"
                          alt="Feature blob"
                          className="absolute inset-0 w-32 h-32 m-auto object-cover rounded-lg group-hover:animate-[sparkle_1s_ease-in-out]"
                        />
                      </div>
                      <h3 className="font-medium text-base">Track Attendance</h3>
                      <p className="text-xs text-gray-600">Verify event participation</p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border-2 border-black shadow-large group overflow-hidden">
                      <div className="relative">
                        <div className="aspect-square rounded-lg bg-lila-300 mb-3" />
                        <img
                          src="/images/blob1.svg"
                          alt="Feature blob"
                          className="absolute inset-0 w-32 h-32 m-auto object-cover rounded-lg group-hover:animate-[sparkle_1s_ease-in-out]"
                        />
                      </div>
                      <h3 className="font-medium text-base">Mint POAPs</h3>
                      <p className="text-xs text-gray-600">Generate unique collectibles</p>
                    </div>
                  </div>

                  <div className="w-52 flex-none space-y-8 pt-24 sm:pt-0">
                    <div className="bg-white p-3 rounded-xl border-2 border-black shadow-large group overflow-hidden">
                      <div className="relative">
                        <div className="aspect-square rounded-lg bg-lila-300 mb-3" />
                        <img
                          src="/images/blob2.svg"
                          alt="Feature blob"
                          className="absolute inset-0 w-32 h-32 m-auto object-cover rounded-lg group-hover:animate-[sparkle_1s_ease-in-out]"
                        />
                      </div>
                      <h3 className="font-medium text-base">Share Memories</h3>
                      <p className="text-xs text-gray-600">Connect with community</p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border-2 border-black shadow-large group overflow-hidden">
                      <div className="relative">
                        <div className="aspect-square rounded-lg bg-lila-300 mb-3" />
                        <img
                          src="/images/blob5.svg"
                          alt="Feature blob"
                          className="absolute inset-0 w-32 h-32 m-auto object-cover rounded-lg group-hover:animate-[sparkle_1s_ease-in-out]"
                        />
                      </div>
                      <h3 className="font-medium text-base">Collect Badges</h3>
                      <p className="text-xs text-gray-600">Build your presence</p>
                    </div>
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
