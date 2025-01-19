"use client"

import { Wallet } from '@alephium/web3-react';
import React from 'react';

export default function NFTList({ account }: { account: string }) {
  // Mock data - in real app would come from props or API

  console.log(account)

  const truncatedAccount = account.slice(0, 4) + '...' + account.slice(-4);

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
    }
  ];

  return (
    <section className="py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-12">
          <h2 className="text-2xl lg:text-4xl font-semibold text-black text-center">
             Your Presence ({truncatedAccount})
          </h2>
          <div className="text-black items-center shadow shadow-black text-xs font-semibold inline-flex px-4 bg-lila-300 border-black border-2 py-2 rounded-lg tracking-wide">
            {nfts.length} Events
          </div>
     
        </div>

<div className="flex justify-center items-center mb-24">     {
            account && (
                <a
                    className="text-black mr-6 items-center shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white w-full sm:w-auto py-2 rounded-lg h-14 focus:translate-y-1 hover:text-lila-800 tracing-wide"
            href="/new-event"
            title="link to your page"
            aria-label="your label"
          >
            Create New Event  <span className="ml-3">&rarr;</span>
   
            </a>
        )
      }</div>
        

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">


            
          {nfts.map((nft) => (
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
      </div>
    </section>
  );
}
