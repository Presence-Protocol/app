"use client"

import React, { useState } from 'react';

export default function MintNFTSimple() {
  const [quantity, setQuantity] = useState(1);

  // Mock data - in real app would come from props or API
  const nftCollection = {
    title: "ALPHGlobal London 2024 POAP",
    description: "Commemorative NFT for attending ALPHGlobal London 2024", 
    image: "/sample-nft.png",
    price: 0.01,
    maxSupply: 1000,
    currentSupply: 423
  };

  return (
    <section>
      <div className="mx-auto bg-lila-200">
        <div className="relative justify-center max-h-[calc(100vh-82px)] overflow-hidden px-4 h-screen">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-full max-w-lg p-8 text-center">
              <div className="w-64 h-64 mx-auto rounded-2xl border-2 border-black shadow bg-white">
                <img 
                  src={nftCollection.image} 
                  alt={nftCollection.title} 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <h3 className="mt-6 text-2xl font-medium text-black">{nftCollection.title}</h3>
              <p className="mt-2 text-sm text-black">{nftCollection.description}</p>
              <div className="mt-4 flex justify-center gap-4">
                <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-6 bg-lila-300 border-lila-600 border-2 py-3 rounded-lg h-8 tracking-wide">
                  {nftCollection.currentSupply} / {nftCollection.maxSupply}
                </div>
                <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-6 bg-lila-300 border-lila-600 border-2 py-3 rounded-lg h-8 tracking-wide">
                  {nftCollection.price} ALPH
                </div>
              </div>

              <div className="mt-12">
                <button
                  type="button"
                  aria-label="mint"
                  className="text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:text-lila-800"
                >
                  Mint NFT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
