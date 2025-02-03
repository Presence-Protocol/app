"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlephiumConnectButton, useWallet } from '@alephium/web3-react'
import { useWalletLoading } from '@/context/WalletLoadingContext';

import { addressFromContractId, hexToString, web3 } from '@alephium/web3';
import { PoapCollection, PoapNFT } from 'my-contracts';

interface NFTMetadata {
  title: string;
  description: string;
  image: string;
  tokenId: string;
  mintDate: string;
}

interface POAPResponse {
  contractId: string;
  collectionContractId: string;
  nftIndex: number;
  caller: string;
  createdAt: string;
  updatedAt: string;
}

export default function NFTList({ account }: { account: string }) {
  const truncatedAccount = account.slice(0, 4) + '...' + account.slice(-4);
  const [showAllNFTs, setShowAllNFTs] = useState(false);
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    console.log('Setting up node provider...');
   web3.setCurrentNodeProvider(
      process.env.NEXT_PUBLIC_NODE_URL ?? "https://node.testnet.alephium.org",
      undefined,
      undefined
    );
    console.log('Node provider setup complete');
    const fetchNFTs = async () => {
      try {
        // Fetch POAP data
        const response = await fetch(`https://presenceprotocol.notrustverify.ch/api/poap/${account}`);
        const poapData: POAPResponse[] = await response.json();

        // Fetch metadata for each POAP
        const nftPromises = poapData.map(async (poap) => {
          const collection = PoapNFT.at(addressFromContractId(poap.contractId));
          const collectionMetadata = await collection.fetchState();

          return {
            title: hexToString(collectionMetadata.fields.eventName),
            description: hexToString(collectionMetadata.fields.description),
            image: hexToString(collectionMetadata.fields.eventImage),
            tokenId: `#${poap.nftIndex}`,
            mintDate: new Date(poap.createdAt).toLocaleDateString()
          };
        });

        const nftMetadata = await Promise.all(nftPromises);
        setNfts(nftMetadata);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, [account]);



  const displayedNFTs = showAllNFTs ? nfts : nfts.slice(0, 6);

  if (isLoading) {
    return (
      <section className="py-24 px-4 md:px-8 bg-lila-200">
        <div className="mx-auto max-w-7xl text-center">
          Loading your POAPs...
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-4 md:px-8 bg-lila-200">
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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-black">Your Events</h3>
            <Link
              className="text-black items-center shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-2 rounded-lg h-12 focus:translate-y-1 hover:text-lila-800 tracking-wide"
              href="/new-event"
            >
              Create Your Event <span className="ml-3">&rarr;</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {displayedNFTs.map((nft, index) => (
              <div
                key={index}
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
        
      </div>
    </section>
  );
}
