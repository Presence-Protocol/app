"use client"

import { addressFromContractId, contractIdFromAddress, DUST_AMOUNT, hexToString, MINIMAL_CONTRACT_DEPOSIT, NetworkId, stringToHex, web3 } from '@alephium/web3';
import { useWallet } from '@alephium/web3-react';
import { PoapFactory, PoapCollection, PoapFactoryTypes, PoapFactoryInstance, PoapCollectionInstance } from 'my-contracts';
import { loadDeployments } from 'my-contracts/deployments';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface NFTCollection {
  title: string;
  description: string;
  image: string | null;
  price: number;
  maxSupply: bigint;
  mintEndDate: bigint;
  mintStartDate: bigint;
  eventStartDate: bigint;
  eventEndDate: bigint;
  location: string;
  currentSupply: bigint;
  isPublic: boolean;
}

export default function MintNFTSimple() {
  const [quantity, setQuantity] = useState(1);
  const [contractId, setContractId] = useState<string | null>(null);
  const [factoryContract, setFactoryContract] = useState<PoapFactoryInstance | null>(null);
  const [poapCollection, setPoapCollection] = useState<PoapCollectionInstance | null>(null);
  const { account, signer } = useWallet();
  const [isMinting, setIsMinting] = useState(false);

  const [nftCollection, setNftCollection] = useState<NFTCollection>({
    title: '00',
    description: '00',
    image: null,
    price: 0.1, 
    maxSupply: BigInt(0),
    mintEndDate: BigInt(0),
    mintStartDate: BigInt(0),
    eventStartDate: BigInt(0),
    eventEndDate: BigInt(0),
    location: '00',
    currentSupply: BigInt(0),
    isPublic: false
  });

  useEffect(() => {
  
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const idMatch = hash.match(/id=([^&]*)/);
      const id = idMatch ? idMatch[1] : null;
      setContractId(id);
    }
  }, []);

  useEffect(() => {
    web3.setCurrentNodeProvider(
      process.env.NEXT_PUBLIC_NODE_URL ?? "https://node.testnet.alephium.org",
      undefined,
      undefined
    );
    const deployment = loadDeployments(process.env.NEXT_PUBLIC_NETWORK as NetworkId ?? 'testnet');
    if (deployment.contracts.PoapFactory) {
      setFactoryContract(PoapFactory.at(deployment.contracts.PoapFactory.contractInstance.address));
    }

    if (contractId) {
      const collectionAddress = contractId;
      
      const collection = PoapCollection.at(collectionAddress);
      setPoapCollection(collection);
      
      collection.fetchState()
        .then((collectionMetadata) => {
          // console.log(collectionMetadata);
          setNftCollection({ 
            title: hexToString(collectionMetadata.fields.eventName),
            description: hexToString(collectionMetadata.fields.description),
            image: hexToString(collectionMetadata.fields.eventImage),
            price: 0.1,
            maxSupply: collectionMetadata.fields.maxSupply,
            currentSupply: collectionMetadata.fields.totalSupply,
            isPublic: collectionMetadata.fields.isPublic,
            location: hexToString(collectionMetadata.fields.location),
            mintStartDate: collectionMetadata.fields.mintStartAt,
            mintEndDate: collectionMetadata.fields.mintEndAt,
            eventStartDate: collectionMetadata.fields.eventStartAt,
            eventEndDate: collectionMetadata.fields.eventEndAt
          });
        })
        .catch((error) => {
          console.error('Error fetching collection state:', error);
        });
        // console.log(collection);
    } else {
      // console.log('No contract ID provided');
    }
  }, [contractId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMinting(true);

    try {
      if (!signer) {
        throw new Error('Signer not available')
      }
      if (!factoryContract) {
        throw new Error('Factory contract not initialized')
      }
      if (!poapCollection) {
        throw new Error('POAP collection not initialized')
      }

      await factoryContract.transact.mintPoap({
        args: {
          collection: poapCollection.contractId,
          amount: 0n,
          password: ''
        },
        signer: signer,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
      });
    } catch (error) {
      console.error('Error minting Presence:', error);
    } finally {
      setIsMinting(false);
    }
  }

  const formatDate = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <section>
      <div className="mx-auto bg-lila-200">
        <div className="relative justify-center h-[calc(100vh-80px)] overflow-hidden px-4">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-full max-w-4xl p-8 flex gap-8 items-center">
              {/* Left Column - Image */}
              <div className="w-1/2">
                <div className="w-full aspect-square rounded-2xl border-2 border-black shadow bg-white">
                  <img 
                    src={nftCollection.image ?? undefined}
                    alt={nftCollection.title} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>

              {/* Right Column - Content */}
              <div className="w-1/2 text-left">
                <h3 className="text-2xl font-medium text-black">{nftCollection.title}</h3>
                <p className="mt-2 text-sm text-black">{nftCollection.description}</p>

                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-6 bg-lila-300 border-lila-600 border-2 py-3 rounded-lg h-8 tracking-wide">
                      {nftCollection.currentSupply.toString()} / {nftCollection.maxSupply.toString()}
                    </div>
                    <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-6 bg-lila-300 border-lila-600 border-2 py-3 rounded-lg h-8 tracking-wide">
                      {nftCollection.price} ALPH
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">{nftCollection.location}</span>
                      <span className="text-gray-400">•</span>
                      <span className={`${nftCollection.isPublic ? 'text-black' : 'text-gray-600'}`}>
                        {nftCollection.isPublic ? 'Public Event' : 'Private Event'}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{formatDate(nftCollection.eventStartDate)} - {formatDate(nftCollection.eventEndDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleSubmit}
                    type="button"
                    aria-label="mint"
                    disabled={isMinting}
                    className="text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white 
                    border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:text-lila-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isMinting ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin">
                          <Image 
                            src="/images/blob5.svg"
                            alt="Minting..."
                            width={60}
                            height={60}
                            className="opacity-70"
                            priority
                          />
                        </div>
                        <span>Minting...</span>
                      </div>
                    ) : (
                      'Mint Presence'
                    )}
                  </button>

                  <div className="text-xs text-gray-500 mt-5 text-center">
                    Minting available until {formatDate(nftCollection.mintEndDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
