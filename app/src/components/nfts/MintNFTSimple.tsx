"use client"

import { addressFromContractId, contractIdFromAddress, DUST_AMOUNT, hexToString, MINIMAL_CONTRACT_DEPOSIT, NetworkId, stringToHex, waitForTxConfirmation, web3 } from '@alephium/web3';
import { useWallet } from '@alephium/web3-react';
import { PoapFactory, PoapCollection, PoapFactoryTypes, PoapFactoryInstance, PoapCollectionInstance } from 'my-contracts';
import { loadDeployments } from 'my-contracts/deployments';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import MintSuccessModal from '../Modals/MintSuccessModal';
import Confetti from 'react-confetti'
import useWindowSize from '@/hooks/useWindowSize'
import AlreadyMintedWarning from '../Modals/AlreadyMintedWarning';

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
  amountForStorageFees: bigint;
  oneMintPerAddress: boolean;
}

export default function MintNFTSimple() {
  const { connectionStatus } = useWallet();
  const [quantity, setQuantity] = useState(1);
  const [contractId, setContractId] = useState<string | null>(null);
  const [factoryContract, setFactoryContract] = useState<PoapFactoryInstance | null>(null);
  const [poapCollection, setPoapCollection] = useState<PoapCollectionInstance | null>(null);
  const { account, signer } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMintSuccessOpen, setIsMintSuccessOpen] = useState(false);
  const [mintTxId, setMintTxId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const [isAlreadyMintedOpen, setIsAlreadyMintedOpen] = useState(false);
  const [mintEvents, setMintEvents] = useState<Array<{
    caller: string;
    nftIndex: bigint;
    timestamp: number;
  }>>([]);

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
    isPublic: false,
    amountForStorageFees: 0n,
    oneMintPerAddress: false
  });

  useEffect(() => {
    // console.log('UseEffect running');
    // Setup web3
    

    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const idMatch = hash.match(/id=([^&]*)/);
      const id = idMatch ? idMatch[1] : null;
      setContractId(id);
    }
  }, []);

  useEffect(() => {
    console.log('UseEffect running')
    web3.setCurrentNodeProvider(
      process.env.NEXT_PUBLIC_NODE_URL ?? "https://node.testnet.alephium.org",
      undefined,
      undefined
    );
    const deployment = loadDeployments(process.env.NEXT_PUBLIC_NETWORK as NetworkId ?? 'testnet');
    setFactoryContract(PoapFactory.at(deployment.contracts.PoapFactory.contractInstance.address));


    if (contractId) {
      const collectionAddress = contractId;
      setIsLoading(true);
      setError(null);
      
      const collection = PoapCollection.at(collectionAddress);
      setPoapCollection(collection);
      
      collection.fetchState()
        .then((collectionMetadata) => {
          console.log(collectionMetadata)
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
            eventEndDate: collectionMetadata.fields.eventEndAt,
            amountForStorageFees: collectionMetadata.fields.amountForStorageFees,
            oneMintPerAddress: collectionMetadata.fields.oneMintPerAddress
          });
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching collection state:', error);
          setError('Failed to load event details. Please try again later.');
          setIsLoading(false);
        });
    } else {
      console.log('No contract ID provided');
      setError('No event ID provided');
      setIsLoading(false);
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

      const result = await factoryContract.transact.mintPoap({
        args: {
          collection: poapCollection.contractId,
        },
        signer: signer,
        attoAlphAmount: nftCollection.amountForStorageFees > MINIMAL_CONTRACT_DEPOSIT ? DUST_AMOUNT : MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
      });

      await waitForTxConfirmation(result.txId, 1, 5*1000);
      setShowConfetti(true)
      setIsMintSuccessOpen(true);
      setIsMinting(false);
    } catch (error: any) {
      console.error('Error minting Presence:', error);
      setIsMinting(false);
      
      // Check for already minted error
      if (error.message?.includes('Assertion Failed in Contract') && error.message?.includes('Error Code: 6')) {
        setIsAlreadyMintedOpen(true);
      } else {
        setError('Failed to mint Presence. Please try again later.');
      }
    }
  }

  // Add event subscription
  useEffect(() => {
    if (!poapCollection) return;

    let isSubscribed = true;
    const subscription = poapCollection.subscribePoapMintedEvent({
      pollingInterval: 5000,
      messageCallback: async (event) => {
        console.log('Minted event:', event);
        if (isSubscribed) {
          setMintEvents(prev => {
            const exists = prev.some(e => 
              e.caller === event.fields.caller && 
              e.nftIndex === event.fields.nftIndex
            );
            if (exists) return prev;
            
            return [...prev, {
              caller: event.fields.caller,
              nftIndex: event.fields.nftIndex,
              timestamp: Number(event.fields.timestamp)
            }];
          });
        }
        return Promise.resolve();
      },
      errorCallback: (error, subscription) => {
        console.error('Error from collection contract:', error);
        if (isSubscribed) {
          subscription.unsubscribe();
        }
        return Promise.resolve();
      }
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [poapCollection]);

  const formatDate = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Add useEffect to control confetti duration
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <section className="bg-lila-200 pt-16 pb-16 sm:pt-0 sm:pb-0">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#E5D4FF', '#FFF3DA', '#FFD1DA', '#D0BFFF']} // lila color palette
          tweenDuration={3000}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }}
        />
      )}
      <div className="mx-auto bg-lila-200">
        <div className="relative justify-center overflow-hidden px-4 pb-8 ">
          <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-82px)]">
            <div className="w-full max-w-lg p-8 text-center">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin">
                    <Image 
                      src="/images/blob5.svg"
                      alt="Loading..."
                      width={60}
                      height={60}
                      className="opacity-70"
                      priority
                    />
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-800 p-4 rounded-lg text-white border flex items-center justify-center gap-2  ">
                  <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon size-6 icon-tabler icon-tabler-alert-triangle text-white mr-1"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"
                            ></path>
                            <path d="M12 9v4"></path>
                            <path
                              d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"
                            ></path>
                            <path d="M12 16h.01"></path>
                          </svg>{error}
                </div>
              ) : (
                <>
                  <div className="w-64 h-64 mx-auto rounded-2xl border-2 border-black shadow bg-white">
                    <img 
                      src={nftCollection.image ?? undefined}
                      alt={nftCollection.title} 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <h3 className="mt-6 text-2xl font-medium text-black">{nftCollection.title}</h3>
                  <p className="mt-2 text-sm text-black">{nftCollection.description}</p>

                  <div className="mt-4 flex flex-col gap-4">
                    <div className="flex justify-center gap-4">
                      <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-4 bg-lila-300 border-lila-600 border-2 py-2 rounded-lg h-8 tracking-wide">
                        {nftCollection.currentSupply.toString()} / {nftCollection.maxSupply.toString()}
                      </div>
                      {nftCollection.oneMintPerAddress && (
                        <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-4 bg-lila-300 border-lila-600 border-2 py-2 rounded-lg h-8 tracking-wide">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                          </svg>
                          <span>1 Per Wallet</span>
                        </div>
                      )}
                      {nftCollection.price > 0 && (
                        <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-6 bg-lila-300 border-lila-600 border-2 py-3 rounded-lg h-8 tracking-wide">
                          {nftCollection.price} ALPH
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{nftCollection.location}</span>
                          {nftCollection.location && <span className="text-gray-400 hidden sm:inline">•</span>}
                          <span className="text-gray-600">
                            {nftCollection.isPublic ? 'Public Event' : 'Private Event'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 hidden sm:inline">•</span>
                          <span className="text-gray-600">
                            {formatDate(nftCollection.eventStartDate)} - {formatDate(nftCollection.eventEndDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={handleSubmit}
                      type="button"
                      aria-label="mint"
                      disabled={isMinting || connectionStatus !== 'connected' || Date.now() < Number(nftCollection.mintStartDate)}
                      className="text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white 
                      border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:text-lila-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isMinting ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin">
                            <Image 
                              src="/images/blob5.svg"
                              alt="Minting..."
                              width={30}
                              height={30}
                              className="opacity-70"
                              priority
                            />
                          </div>
                          <span>Minting...</span>
                        </div>
                      ) : connectionStatus !== 'connected' ? (
                        'Connect Wallet'
                      ) : Date.now() < Number(nftCollection.mintStartDate) ? (
                        `Minting starts ${formatDate(nftCollection.mintStartDate)}`
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lila-600 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-lila-800"></span>
                          </div>
                          <span>Mint Presence</span>
                        </div>
                      )}
                    </button>

                    <div className="text-sm text-center">
                      <div className="text-gray-600">
                        
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-5">
                      {Date.now() < Number(nftCollection.mintStartDate) ? (
                        <>Minting starts {formatDate(nftCollection.mintStartDate)} and ends {formatDate(nftCollection.mintEndDate)}</>
                      ) : (
                        <>Minting available until {formatDate(nftCollection.mintEndDate)}</>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mint Events Table */}
        {mintEvents.length > 0 && (
          <div className="max-w-lg mx-auto px-4 pb-8">
            <h3 className="text-xl font-medium text-black mb-4">Recent Mints</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-2 border-black rounded-lg bg-white">
                <thead className="bg-lila-300 border-b-2 border-black">
                  <tr>
                    <th className="px-4 py-2 text-left">Minter</th>
                    <th className="px-4 py-2 text-left">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black">
                  {[...mintEvents]
                    .reverse()
                    .map((event, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <span className="font-mono text-sm">
                            {`${event.caller.slice(0, 6)}...${event.caller.slice(-4)}`}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {new Date(event.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <MintSuccessModal
        isOpen={isMintSuccessOpen}
        isMinting={isMinting}
        onClose={() => setIsMintSuccessOpen(false)}
        nftImage={nftCollection.image}
        nftTitle={nftCollection.title}
        eventDate={`${formatDate(nftCollection.eventStartDate)} - ${formatDate(nftCollection.eventEndDate)}`}
      />
      <AlreadyMintedWarning
        isOpen={isAlreadyMintedOpen}
        onClose={() => setIsAlreadyMintedOpen(false)}
      />
    </section>
  );
}
