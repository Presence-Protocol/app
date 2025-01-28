'use client';

import { useState } from 'react';

// Define an array of items
const items = [
  {
    bgColor: "bg-lila-500",
    imgSrc: "/images/blob1.svg", 
    title: "Decentralized Exchanges",
    description: "Embrace peer-to-peer trading without intermediaries. Trade directly with other users on our platform, enjoying the benefits of decentralization.",
  },
  {
    bgColor: "bg-green-500",
    imgSrc: "/images/blob2.svg",
    title: "Staking Rewards", 
    description: "Put your crypto assets to work and earn passive income through staking, a feature that allows you to participate in network validation and reap rewards.",
  },
  {
    bgColor: "bg-yellow-500",
    imgSrc: "/images/blob3.svg",
    title: "NFT Marketplace",
    description: "Immerse yourself in the world of non-fungible tokens (NFTs) with our marketplace. Buy, sell, and even create unique digital collectibles.",
  },
  {
    bgColor: "bg-red-500",
    imgSrc: "/images/blob4.svg",
    title: "Instant Transactions",
    description: "Experience the convenience of near-instantaneous cryptocurrency transfers, allowing you to send and receive digital assets.",
  },
  {
    bgColor: "bg-lila-500",
    imgSrc: "/images/blob5.svg",
    title: "Crypto Education",
    description: "Access a wealth of educational resources to expand your knowledge of blockchain technology.",
  },
  {
    bgColor: "bg-green-500",
    imgSrc: "/images/blob6.svg",
    title: "Mobile App",
    description: "Seamlessly trade and manage your crypto assets on the go with our mobile application, offering all the features and convenience you expect.",
  },

];

export default function FeatureSeven() {
  const [atBeginning, setAtBeginning] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  const handleNext = (slider: HTMLElement) => {
    const current = slider.scrollLeft;
    const offset = slider.firstElementChild?.getBoundingClientRect().width || 0;
    slider.scrollTo({ left: current + offset, behavior: 'smooth' });
  };

  const handlePrev = (slider: HTMLElement) => {
    const current = slider.scrollLeft;
    const offset = slider.firstElementChild?.getBoundingClientRect().width || 0;
    slider.scrollTo({ left: current - offset, behavior: 'smooth' });
  };

  const handleIntersect = (entry: IntersectionObserverEntry, isFirst: boolean, isLast: boolean) => {
    if (entry.isIntersecting) {
      if (isFirst) setAtBeginning(true);
      if (isLast) setAtEnd(true);
    } else {
      if (isFirst) setAtBeginning(false);
      if (isLast) setAtEnd(false);
    }
  };

  return (
    <section className="overflow-hidden">
      <div className="relative items-center w-full divide-y-2 divide-black mx-auto  overflow-hidden">
        <div className="flex flex-col w-full">
          <div 
            className="flex flex-col w-full"
            aria-labelledby="carousel-label"
            role="region"
            tabIndex={0}
          >
            <div className="flex flex-col lg:flex-row lg:divide-x-2 divide-black">
              <div className="p-8 lg:p-20 bg-yellow-500">
                <div>
                  <p className="text-3xl lg:text-7xl tracking-tight font-medium text-black">
                    Real-time <span className="block">Market Data</span>
                  </p>
                  <p className="text-base lg:text-base w-full mt-4 text-black max-w-xs">
                    Rest easy knowing your crypto assets are protected by state-of-the-art security measures and encryption, ensuring the safety of your digital wealth.
                  </p>
                </div>
                <div className="items-center inline-flex mt-4 order-last space-x-2">
                  <button
                    className={`inline-flex items-center justify-center size-10 shadow-tiny bg-white focus:shadow-none duration-300 text-sm border-2 border-black rounded-full cursor-pointer hover:bg-lila-500 ${atBeginning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-disabled={atBeginning}
                    tabIndex={atEnd ? -1 : 0}
                    onClick={(e) => {
                      const slider = e.currentTarget.closest('.flex-col')?.querySelector('.overflow-x-scroll') as HTMLElement;
                      if (slider) handlePrev(slider);
                    }}
                  >
                    <svg className="size-6" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M30.772 19.1064L31.772 19.1064L31.772 17.1064L30.772 17.1064L30.772 19.1064ZM4.77197 17.1064C4.21969 17.1064 3.77197 17.5542 3.77197 18.1064C3.77197 18.6587 4.21969 19.1064 4.77197 19.1064L4.77197 17.1064ZM13.772 28.1064L13.772 29.1064L15.772 29.1064L15.772 28.1064L13.772 28.1064ZM5.35131 17.329C4.86646 17.0646 4.25903 17.2433 3.99457 17.7281C3.73012 18.213 3.90879 18.8204 4.39364 19.0849L5.35131 17.329ZM15.7721 8.20695L15.7721 7.20695L13.7721 7.20695L13.7721 8.20695L15.7721 8.20695ZM30.772 17.1064L4.87256 17.1064L4.87256 19.1064L30.772 19.1064L30.772 17.1064ZM4.87256 17.1064L4.77197 17.1064L4.77197 19.1064L4.87256 19.1064L4.87256 17.1064ZM15.772 28.1064C15.772 26.634 14.9767 25.2277 14.0004 24.0295C13.0042 22.8069 11.7003 21.6567 10.4337 20.6779C9.16112 19.6946 7.89353 18.8595 6.94694 18.2715C6.47271 17.9769 6.0768 17.7429 5.7982 17.5819C5.65886 17.5014 5.54872 17.439 5.47264 17.3964C5.4346 17.3751 5.40507 17.3587 5.38465 17.3474C5.37444 17.3417 5.36651 17.3374 5.36092 17.3343C5.35813 17.3328 5.35593 17.3316 5.35433 17.3307C5.35352 17.3303 5.35287 17.3299 5.35237 17.3296C5.35212 17.3295 5.35185 17.3293 5.35173 17.3293C5.3515 17.3292 5.35131 17.329 4.87248 18.207C4.39364 19.0849 4.39353 19.0848 4.39345 19.0848C4.39348 19.0848 4.39344 19.0847 4.39349 19.0848C4.39359 19.0848 4.39384 19.085 4.39423 19.0852C4.39503 19.0856 4.39641 19.0864 4.39838 19.0875C4.40232 19.0896 4.40858 19.0931 4.4171 19.0978C4.43414 19.1072 4.4602 19.1217 4.49466 19.141C4.5636 19.1796 4.66615 19.2377 4.79749 19.3136C5.06027 19.4654 5.43776 19.6885 5.8916 19.9704C6.80118 20.5354 8.00846 21.3314 9.21078 22.2605C10.419 23.1941 11.59 24.2375 12.4499 25.2929C13.3298 26.3727 13.772 27.3289 13.772 28.1064L15.772 28.1064Z" fill="black"></path>
                    </svg>
                  </button>
                  <button
                    className={`inline-flex items-center justify-center size-10 shadow-tiny bg-white focus:shadow-none duration-300 text-sm border-2 border-black rounded-full cursor-pointer hover:bg-lila-500 ${atEnd ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-disabled={atEnd}
                    tabIndex={atEnd ? -1 : 0}
                    onClick={(e) => {
                      const slider = e.currentTarget.closest('.flex-col')?.querySelector('.overflow-x-scroll') as HTMLElement;
                      if (slider) handleNext(slider);
                    }}
                  >
                    <svg className="size-6" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.22803 16.8936H4.22803V18.8936H5.22803V16.8936ZM31.228 18.8936C31.7803 18.8936 32.228 18.4458 32.228 17.8936C32.228 17.3413 31.7803 16.8936 31.228 16.8936V18.8936ZM22.228 7.89355V6.89355H20.228V7.89355H22.228ZM30.6487 18.671C31.1335 18.9354 31.741 18.7567 32.0054 18.2719C32.2699 17.787 32.0912 17.1796 31.6064 16.9151L30.6487 18.671ZM20.2279 27.793V28.793H22.2279V27.793H20.2279ZM5.22803 18.8936H31.1274V16.8936H5.22803V18.8936ZM31.1274 18.8936H31.228V16.8936H31.1274V18.8936ZM20.228 7.89355C20.228 9.36597 21.0233 10.7723 21.9996 11.9705C22.9958 13.1931 24.2997 14.3433 25.5663 15.3221C26.8389 16.3054 28.1065 17.1405 29.0531 17.7285C29.5273 18.0231 29.9232 18.2571 30.2018 18.4181C30.3411 18.4986 30.4513 18.561 30.5274 18.6036C30.5654 18.6249 30.5949 18.6413 30.6153 18.6526C30.6256 18.6583 30.6335 18.6626 30.6391 18.6657C30.6419 18.6672 30.6441 18.6684 30.6457 18.6693C30.6465 18.6697 30.6471 18.6701 30.6476 18.6704C30.6479 18.6705 30.6481 18.6707 30.6483 18.6707C30.6485 18.6709 30.6487 18.671 31.1275 17.793C31.6064 16.9151 31.6065 16.9152 31.6065 16.9152C31.6065 16.9152 31.6066 16.9153 31.6065 16.9152C31.6064 16.9152 31.6062 16.915 31.6058 16.9148C31.605 16.9144 31.6036 16.9136 31.6016 16.9125C31.5977 16.9104 31.5914 16.9069 31.5829 16.9022C31.5659 16.8928 31.5398 16.8783 31.5053 16.859C31.4364 16.8204 31.3339 16.7623 31.2025 16.6864C30.9397 16.5346 30.5622 16.3115 30.1084 16.0296C29.1988 15.4646 27.9915 14.6686 26.7892 13.7395C25.581 12.8059 24.41 11.7625 23.5501 10.7071C22.6702 9.62726 22.228 8.67114 22.228 7.89355H20.228Z" fill="black"></path>
                    </svg>
                    <span className="sr-only">Skip to next slide page</span>
                  </button>
                </div>
              </div>
              <div className="relative w-full snap-x lg:-mr-[90rem] mt-12 lg:mt-0">
                <div className="w-full justify-between h-full">
                  <ul
                    className="gap-3 overflow-x-scroll h-full bg--500 lg:pl-48 p-8 lg:p-20 w-screen grid grid-flow-col auto-cols-max scrollbar-hide snap-mandatory"
                    role="listbox"
                    aria-labelledby="carousel-content-label"
                    tabIndex={0}
                  >
                    {items.map((item, index) => (
                      <li
                        key={index}
                        role="option"
                        className="snap-start w-64 lg:w-96 h-full"
                        ref={(el) => {
                          if (!el) return;
                          const observer = new IntersectionObserver(
                            (entries) => handleIntersect(entries[0], index === 0, index === items.length - 1),
                            { threshold: 0.5 }
                          );
                          observer.observe(el);
                          return () => observer.disconnect();
                        }}
                      >
                        <div className={`border-2 border-black shadow-large p-8 rounded-3xl h-full ${item.bgColor}`}>
                          <img className="size-20" src={item.imgSrc} alt={item.title} />
                          <h2 className="text-xl font-medium mt-12">{item.title}</h2>
                          <p className="text-lg tracking-wide mt-4">{item.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
