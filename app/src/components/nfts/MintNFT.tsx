"use client"

import React, { useState } from 'react';

export default function MintNFT() {
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
      <div className="mx-auto  ">
        <div className="relative justify-center max-h-[calc(100vh-82px)] lg:max-h-[calc(100vh-82px)] md:max-h-[calc(100vh-58px)] overflow-hidden lg:px-0 md:px-12 grid lg:grid-cols-5 h-screen lg:divide-x-2 divide-black">
          <div className="hidden bg-lila-500 lg:col-span-2 lg:block lg:flex-1 lg:relative sm:contents">
            <div className="absolute inset-0 object-cover w-full h-full bg-lila-300">
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
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col flex-1 px-4 py-10 bg-white-500 lg:py-24 md:flex-none md:px-28 sm:justify-center lg:col-span-3">
            <div className="w-full mx-auto md:px-0 sm:px-4 text-center">
              <h2 className="text-2xl lg:text-4xl font-semibold text-black max-w-4xl">
                Mint Your Presence
              </h2>

              <p className="text-lg text-black tracking-wide mt-4 text-balance">
                Join the community by minting this exclusive POAP Presence
              </p>

              <form className="mt-12">
                <div className="space-y-6">
                  <div className="border-2 border-black divide-black shadow rounded-xl overflow-hidden">
                    <div>
                      <label htmlFor="quantity" className="sr-only">Quantity</label>
                      <input
                        id="quantity"
                        type="number"
                        min="1"
                        max="10"
                        placeholder="Quantity to mint (max 10)"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="block w-full px-3 py-4 text-xl text-black border-2 border-transparent appearance-none placeholder-black border-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-lila-100 border-2 border-black rounded-xl p-6 text-left">
                    <div className="flex justify-between mb-2">
                      <span>Price per mint</span>
                      <span>{nftCollection.price} ALPH</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Quantity</span>
                      <span>{quantity}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t-2 border-black">
                      <span>Total</span>
                      <span>{(nftCollection.price * quantity).toFixed(3)} ALPH</span>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      aria-label="mint"
                      className="text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:text-lila-800"
                    >
                      Mint Presence
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
