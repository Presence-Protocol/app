import React from 'react';

// How it works
const items = [
  {
    number: "1",
    title: "Save memories on-chain", 
    description:
      "Rest easy knowing your crypto assets are protected by state-of-the-art security measures and encryption, ensuring the safety of your digital wealth.",
  },
  {
    number: "2",
    title: "Track Attendance",
    description: 
      "Experience the convenience of near-instantaneous cryptocurrency transfers, allowing you to send and receive digital assets in real-time, eliminating delays.",
  },
  {
    number: "6",
    title: "NFT Marketplace", 
    description:
      "Immerse yourself in the world of non-fungible tokens (NFTs) with our marketplace. Buy, sell, and even create unique digital collectibles.",
  },
  {
    number: "7",
    title: "User-Friendly Interface",
    description:
      "Our platform boasts an intuitive and user-friendly design, ensuring a seamless and pleasant experience for both novice and experienced users.",
  },
  {
    number: "8",
    title: "Crypto Education",
    description:
      "Access a wealth of educational resources to expand your knowledge of blockchain technology and cryptocurrencies, empowering you to make informed decisions.",
  },
  {
    number: "9",
    title: "Community Support",
    description:
      "Join a vibrant community of crypto enthusiasts and get help from experienced users, ensuring you have a supportive environment to learn and grow.",
  }
];

export default function FeatureEight() {
  return (
    <section>
      <div
        className="mx-auto lg:flex">
        <div className="lg:w-1/2 p-8 lg:px-20 bg-lila-200">
          <div className="lg:sticker lg:sticky py-16 top-20">
            <div>
              <img
                className="size-8 lg:w-20 lg:h-20 shadow-small shadow-black rounded-full"
                src="/images/blob2.svg"
                alt="your alt-text"
              />

              <h2
                className="text-3xl mt-12 xl:text-6xl tracking-tight font-medium text-black">
                {/* The Use Cases <span className="md:block"> of Presence Protocol</span> */}
                How to use<br/><span className="text-black font-bold uppercase text-6xl tracking-tighter">Presence Protocol</span>
              </h2>
              <p className="max-w-md mt-4 tracking-wide xl:text-xl text-lg text-black">
                Supercharge your attendance and memory management with Presence Protocol, the ultimate solution for preserving and sharing your most cherished moments.
                
              </p>
              <div className="flex-col flex gap-3 mt-10 sm:flex-row">
                <a
                  className="text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   sm:w-auto py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:text-lila-800"
                  href="/new-event"
                >
                  Get started <span className="ml-3">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 bg-green-500 lg:border-l-2 border-black">
          <ul
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-0.5 bg-black list-none"
            role="list">
            {items.map((item) => (
              <li key={item.number} className="bg-white p-8 lg:p-12">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center border-2 border-black shadow-tiny duration-300 shadow-black rounded-full bg-green-500 font-semibold">
                    {item.number}
                  </div>
                  <p className="text-xl mt-8 text-black font-medium">{item.title}</p>
                </div>
                <div className="max-w-xl mt-4 text-base tracking-wide text-black">
                  {item.description}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
