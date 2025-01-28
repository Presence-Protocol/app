'use client';

import { useEffect, useState } from 'react';

export default function HeroOne() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Get mouse position relative to window center
      const x = (e.clientX - window.innerWidth / 2) / 50;
      const y = (e.clientY - window.innerHeight / 2) / 50;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="overflow-hidden relative">
      <div className="mx-auto bg-lila-300 relative overflow-hidden min-h-[90vh] md:min-h-[60vh] flex">
        <img
          className="absolute shadow-large rounded-full shadow-black w-48 h-48 md:w-72 md:h-72 -top-12 -right-12 md:-top-20 md:-right-20 transition-transform duration-200 ease-out"
          style={{ transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)` }}
          src="./images/blob3.svg"
          alt="your alt-text"
        />

        <img
          className="absolute shadow-large rounded-full shadow-black w-48 h-48 md:w-72 md:h-72 -bottom-12 left-8 md:-bottom-20 md:left-12 transition-transform duration-200 ease-out"
          style={{ transform: `translate(${mousePosition.x * 1.2}px, ${mousePosition.y * 1.2}px)` }}
          src="./images/blob4.svg"
          alt="your alt-text"
        />
        <img
          className="absolute w-64 h-64 md:w-96 md:h-96 shadow-large rounded-full shadow-black -bottom-20 -right-12 md:-bottom-32 md:-right-20 transition-transform duration-200 ease-out"
          style={{ transform: `translate(${mousePosition.x * -0.8}px, ${mousePosition.y * 0.8}px)` }}
          src="./images/blob1.svg"
          alt="your alt-text"
        />
        <img
          className="absolute shadow-large rounded-full shadow-black w-48 h-48 md:w-72 md:h-72 bottom-8 -left-12 md:bottom-12 md:-left-20 transition-transform duration-200 ease-out"
          style={{ transform: `translate(${mousePosition.x * 0.6}px, ${mousePosition.y * -0.6}px)` }}
          src="./images/blob2.svg"
          alt="your alt-text"
        />
        <img
          className="absolute shadow-large rounded-full shadow-black w-48 h-48 md:w-72 md:h-72 -top-32 left-32 md:-top-48 md:left-52 transition-transform duration-200 ease-out"
          style={{ transform: `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * 0.4}px)` }}
          src="./images/blob5.svg"
          alt="your alt-text"
        />

        <div className="flex flex-col items-center justify-center text-center mx-auto p-8 lg:p-20 lg:py-48 relative my-auto">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-black text-balance">
              Your Moments, Your Memories, Your Attendance; <br/> <i>Immortalized.</i>
            </h2>
            <p className="text-lg text-black tracking-wide mt-4 text-balance">
              With Presence Protocol, preserving and sharing life's moments has never been easier—or more meaningful.
            </p>
          </div>
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
      </div>
    </section>
  );
}
