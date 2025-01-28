"use client"

import { useState } from 'react';
import Link from 'next/link';

export default function NFTList({ account }: { account: string }) {
  const truncatedAccount = account.slice(0, 4) + '...' + account.slice(-4);
  const [showAllNFTs, setShowAllNFTs] = useState(false);

  // Mock data - in real app would come from props or API
  const nfts = [
    {
      id: 1,
      title: "ALPHGlobal London 2024 POAP",
      description: "Commemorative NFT for attending ALPHGlobal London 2024", 
      image: "/sample-nft.png",
      mintDate: "2024-02-15",
      tokenId: "#1234"
    },
    {
      id: 2,
      title: "Web3 Summit 2024",
      description: "Exclusive NFT for Web3 Summit attendees",
      image: "/sample-nft-2.png", 
      mintDate: "2024-01-20",
      tokenId: "#1235"
    },
    {
      id: 3,
      title: "DeFi Conference",
      description: "DeFi Conference 2024 attendance proof",
      image: "/sample-nft-3.png",
      mintDate: "2024-03-01", 
      tokenId: "#1236"
    },
    {
      id: 4,
      title: "ETH Denver 2024",
      description: "Proof of attendance for ETH Denver hackathon",
      image: "/sample-nft-4.png",
      mintDate: "2024-03-15",
      tokenId: "#1237"
    },
    {
      id: 5,
      title: "NFT Paris",
      description: "Exclusive collectible from NFT Paris conference",
      image: "/sample-nft-5.png",
      mintDate: "2024-04-01",
      tokenId: "#1238"
    },
    {
      id: 6,
      title: "Alephium Meetup NYC",
      description: "Special edition POAP from Alephium NYC community event",
      image: "/sample-nft-6.png",
      mintDate: "2024-04-15",
      tokenId: "#1239"
    },
    {
      id: 7,
      title: "NFT Paris",
      description: "Exclusive collectible from NFT Paris conference",
      image: "/sample-nft-5.png",
      mintDate: "2024-04-01",
      tokenId: "#1238"
    },
    {
      id: 8,
      title: "Alephium Meetup NYC",
      description: "Special edition POAP from Alephium NYC community event",
      image: "/sample-nft-6.png",
      mintDate: "2024-04-15",
      tokenId: "#1239"
    },
    {
      id: 9,
      title: "Alephium Meetup NYC",
      description: "Special edition POAP from Alephium NYC community event",
      image: "/sample-nft-6.png",
      mintDate: "2024-04-15",
      tokenId: "#1239"
    },
  ];

  const events = [
    {
      id: 1,
      title: "Upcoming Hackathon",
      description: "Join us for a 48-hour coding marathon",
      image: "/event-1.png",
      date: "2024-04-20",
      status: "Upcoming"
    },
    {
      id: 2,
      title: "Web3 Workshop", 
      description: "Learn about blockchain development",
      image: "/event-2.png",
      date: "2024-04-25",
      status: "Open"
    }
  ];

  const displayedNFTs = showAllNFTs ? nfts : nfts.slice(0, 6);

  return (
    <section className="py-24  px-4 md:px-8 bg-lila-200">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-center gap-4 mb-12">
          <h2 className="text-2xl lg:text-4xl font-semibold text-black text-center">
            Your Presence ({truncatedAccount})
          </h2>
          <div className="text-black items-center shadow shadow-black text-xs font-semibold inline-flex px-4 bg-lila-300 border-black border-2 py-2 rounded-lg tracking-wide">
            {nfts.length} Events
          </div>
        </div>

        {/* Minted NFTs Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-black mb-6">Your Minted NFTs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedNFTs.map((nft) => (
              <div
                key={nft.id}
                className="border-2 border-black rounded-xl overflow-hidden bg-white shadow"
              >
                <div className="aspect-square overflow-hidden border-b-2 border-black">
                  <img
                    src={nft.image}
                    alt={nft.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 bg-lila-100">
                  <h3 className="text-xl font-semibold text-black mb-2">{nft.title}</h3>
                  <p className="text-sm text-black mb-4">{nft.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t-2 border-black">
                    <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-4 bg-lila-300 border-lila-600 border-2 py-2 rounded-lg tracking-wide">
                      {nft.tokenId}
                    </div>
                    <div className="text-sm text-black font-medium">
                      Minted: {nft.mintDate}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {nfts.length > 6 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setShowAllNFTs(!showAllNFTs)}
                className="text-black items-center shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-2 rounded-lg h-12 focus:translate-y-1 hover:text-lila-800 tracking-wide"
              >
                {showAllNFTs ? 'Show Less' : 'Show More'}
              </button>
            </div>
          )}
        </div>

        {/* Your Events Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-black">Your Events</h3>
            <Link
              className="text-black items-center shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-2 rounded-lg h-12 focus:translate-y-1 hover:text-lila-800 tracking-wide"
              href="/new-event"
            >
              Create New Event <span className="ml-3">&rarr;</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="border-2 border-black rounded-xl overflow-hidden bg-white shadow"
              >
                <div className="aspect-square overflow-hidden border-b-2 border-black">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 bg-lila-100">
                  <h3 className="text-xl font-semibold text-black mb-2">{event.title}</h3>
                  <p className="text-sm text-black mb-4">{event.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t-2 border-black">
                    <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-4 bg-lila-300 border-lila-600 border-2 py-2 rounded-lg tracking-wide">
                      {event.status}
                    </div>
                    <div className="text-sm text-black font-medium">
                      Date: {event.date}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
