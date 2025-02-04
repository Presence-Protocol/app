'use client';

import { useState } from 'react';

export default function HeroOneCopy() {
  return (
    <div className="bg-lila-300">
      <main>
        <div className="relative isolate">
          <div className="overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 pb-24 pt-24 sm:pt-32 lg:px-8 lg:pt-24">
              {/* Top Slider */}
              <div className="flex overflow-hidden mb-16">
                <div className="flex animate-scroll gap-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="flex-none w-52 bg-white p-3 rounded-xl border-2 border-black shadow-large">
                      <div className="relative">
                        <div className="aspect-square rounded-lg bg-lila-300 mb-3" />
                        <img src={`/images/blob${(index % 5) + 1}.svg`} alt="Feature blob" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                      </div>
                      <h3 className="font-medium text-base">Create Events</h3>
                      <p className="text-xs text-gray-600">Host and manage your events</p>
                    </div>
                  ))}
                  {[...Array(4)].map((_, index) => (
                    <div key={`duplicate-${index}`} className="flex-none w-52 bg-white p-3 rounded-xl border-2 border-black shadow-large">
                      <div className="relative">
                        <div className="aspect-square rounded-lg bg-lila-300 mb-3" />
                        <img src={`/images/blob${(index % 5) + 1}.svg`} alt="Feature blob" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                      </div>
                      <h3 className="font-medium text-base">Create Events</h3>
                      <p className="text-xs text-gray-600">Host and manage your events</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="mx-auto max-w-2xl text-center mb-16">
                <h2 className="text-pretty text-5xl font-semibold tracking-tight text-black sm:text-7xl">
                  Your Moments, Your Memories, Your Attendance; <i>Immortalized.</i>
                </h2>
                <p className="mt-8 text-pretty text-lg font-medium text-black sm:max-w-md sm:text-xl/8 lg:max-w-none mx-auto">
                  With Presence Protocol, preserving and sharing life's moments has never been easier—or more meaningful.
                </p>
                <div className="mt-10">
                  <a
                    className="text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white sm:w-auto py-3 rounded-lg h-16 focus:translate-y-1 w-full hover:text-lila-800 tracing-wide"
                    href="/new-collection"
                    title="link to your page"
                    aria-label="your label"
                  >
                    Get started <span className="ml-3">&rarr;</span>
                  </a>
                </div>
              </div>

              {/* Bottom Slider - Reverse Direction */}
              <div className="flex overflow-hidden">
                <div className="flex animate-scroll-reverse gap-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="flex-none w-52 bg-white p-3 rounded-xl border-2 border-black shadow-large">
                      <div className="relative">
                        <div className="aspect-square rounded-lg bg-lila-300 mb-3" />
                        <img src={`/images/blob${((index + 2) % 5) + 1}.svg`} alt="Feature blob" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                      </div>
                      <h3 className="font-medium text-base">Track Attendance</h3>
                      <p className="text-xs text-gray-600">Verify event participation</p>
                    </div>
                  ))}
                  {[...Array(4)].map((_, index) => (
                    <div key={`duplicate-${index}`} className="flex-none w-52 bg-white p-3 rounded-xl border-2 border-black shadow-large">
                      <div className="relative">
                        <div className="aspect-square rounded-lg bg-lila-300 mb-3" />
                        <img src={`/images/blob${((index + 2) % 5) + 1}.svg`} alt="Feature blob" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                      </div>
                      <h3 className="font-medium text-base">Track Attendance</h3>
                      <p className="text-xs text-gray-600">Verify event participation</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes scrollReverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll-reverse {
          animation: scrollReverse 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
