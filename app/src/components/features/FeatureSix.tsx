'use client';

import Link from 'next/link';

// Define the services array
const services = [
  {
    bgColor: "bg-lila-400",
    imgSrc: "/images/blob1.svg",
    title: "Step 1: Name your POAP",
    description:
      "Embrace peer-to-peer trading without intermediaries. Trade directly with other users on our platform, enjoying the benefits of decentralization.",
  },
  {
    bgColor: "bg-lila-400", 
    imgSrc: "/images/blob2.svg",
    title: "Step 2: Add POAP metadata",
    description:
      "Put your crypto assets to work and earn passive income through staking, a feature that allows you to participate in network validation and reap rewards.",
  },
  {
    bgColor: "bg-lila-400",
    imgSrc: "/images/blob3.svg", 
    title: "Step 3: Upload an Image",
    description:
      "Immerse yourself in the world of non-fungible tokens (NFTs) with our marketplace. Buy, sell, and even create unique digital collectibles.",
  },
  {
    bgColor: "bg-lila-400",
    imgSrc: "/images/blob4.svg",
    title: "Step 4: Set your mint amount",
    description:
      "Experience the convenience of near-instantaneous cryptocurrency transfers, allowing you to send and receive digital assets.",
  },
  {
    bgColor: "bg-lila-400",
    imgSrc: "/images/blob5.svg",
    title: "Step 5: Buy your NFT", 
    description:
      "Access a wealth of educational resources to expand your knowledge of blockchain technology.",
  },
  {
    bgColor: "bg-lila-400",
    imgSrc: "/images/blob6.svg",
    title: "Step 6: Stake your NFT",
    description:
      "Seamlessly trade and manage your crypto assets on the go with our mobile application, offering all the features and convenience you expect.",
  },
];

export default function FeatureSix() {
  return (
    <section>
      <div
        // className="items-center w-full mx-auto p-8 lg:p-20 2xl:px-0 border-b-2 border-black 2xl:border-x-2 bg-red-500">
                  className="items-center w-full mx-auto pt-8 pl-8 pr-8 lg:pt-20 lg:pl-20 lg:pr-20  2xl:px-0 bg-white">

        <div className="relative p-8 lg:px20 2xl:px-0 items-center text-center justify-center max-w-3xl mx-auto">
   
          <h2 className="text-4xl lg:text-6xl font-semibold text-black text-balance">
            The Future of Attendance & Memories
          </h2>
 
          <p className="text-lg text-black tracking-wide mt-6 text-balance">
            Supercharge your attendance and memory management with Presence Protocol, the ultimate solution for preserving and sharing your most cherished moments.
          </p>

          <p className="text-black mt-4 mb-4 items-center shadow shadow-black text-xs font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white sm:w-auto py-3 rounded-lg h-8 tracking-wide focus:translate-y-1 w-full hover:text-lila-800">
            <a href="https://alephium.org" target="_blank" className="hover:text-lila-600">Built on Alephium</a>
          </p>
          
        </div>
      </div>


      <div
        className="grid grid-cols-1 lg:pb-12 lg:pl-20 lg:pr-20 pt-8 pb-8 pl-8 pr-8 md:grid-cols-2  text-black xl:grid-cols-3 gap-4">
        {services.map((service, index) => (
          <div
            key={index}
            className={`border-2 border-black shadow-large p-8 rounded-3xl mb-4 ${service.bgColor}`}>
            <img
              className="size-20"
              src={service.imgSrc}
              alt="your alt-text"
            />
            <h2 className="text-xl font-medium mt-12">{service.title}</h2>
            <p className="text-lg tracking-wide mt-4">{service.description}</p>
          </div>
        ))}
      </div>

      <div className="flex w-full pb-20">
              <Link
                className="text-black mx-auto items-center shadow shadow-lila-600 text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-lila-300 focus:bg-lila-600 border-lila-600 duration-300 outline-none focus:shadow-none border-2 sm:w-auto py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:bg-lila-500"
                href="/"
                aria-label="Explore all pages"
              >
                Get started <span className="ml-3">&rarr;</span>
              </Link>
            </div>  

            <div className="flex w-full border-b-2 mx-auto 2xl:border-x-2 border-black">


            </div>

      
    </section>
  );
}
