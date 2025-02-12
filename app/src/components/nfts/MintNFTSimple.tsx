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
}

export default function MintNFTSimple() {
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
  const [showConfetti, setShowConfetti] = useState(true)
  const { width, height } = useWindowSize()

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
    amountForStorageFees: 0n
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
            amountForStorageFees: collectionMetadata.fields.amountForStorageFees
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

      console.log(nftCollection.amountForStorageFees)
      const result = await factoryContract.transact.mintPoap({
        args: {
          collection: poapCollection.contractId,
        },
        signer: signer,
        attoAlphAmount: nftCollection.amountForStorageFees > MINIMAL_CONTRACT_DEPOSIT ?  DUST_AMOUNT : MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
      });

      //setMintTxId(result.txId);
      await waitForTxConfirmation(result.txId, 1, 5*1000);
      setShowConfetti(true)
          setIsMintSuccessOpen(true);
          setIsMinting(false);
    } catch (error) {
      console.error('Error minting Presence:', error);
    }
  }

  // Add event subscription
 /* useEffect(() => {
    if (!poapCollection || !mintTxId || !account?.address) return;

    const subscription = poapCollection.subscribePoapMintedEvent({
      pollingInterval: 5000,
      messageCallback: async (event) => {
        if (event.fields.to === account.address) {
          setShowConfetti(true)
          setIsMintSuccessOpen(true);
          setIsMinting(false);
        }
        return Promise.resolve();
      },
      errorCallback: (error, subscription) => {
        console.error('Error from collection contract:', error);
        subscription.unsubscribe();
        return Promise.resolve();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [poapCollection, mintTxId, account?.address]);*/

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
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={true}
          numberOfPieces={200}
          gravity={0.3}
          tweenDuration={4000}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }}
        />
      )}
      <div className="mx-auto bg-lila-200">
        <div className="relative justify-center h-[calc(100vh-80px)] overflow-hidden px-4">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-full max-w-lg p-8 text-center">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin">
                    <Image 
                      src="/images/blob5.svg"
                      alt="Loading..."
                      width={48}
                      height={48}
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
                            stroke-width="2"
                            stroke="currentColor"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
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
                      <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-6 bg-lila-300 border-lila-600 border-2 py-3 rounded-lg h-8 tracking-wide">
                        {nftCollection.currentSupply.toString()} / {nftCollection.maxSupply.toString()}
                      </div>
                      <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-6 bg-lila-300 border-lila-600 border-2 py-3 rounded-lg h-8 tracking-wide">
                        {nftCollection.price} ALPH
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-">
                      <div className="flex items-center justify-center gap-2 text-sm">
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
                      border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:text-lila-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isMinting ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin">
                            <Image 
                              src="/images/blob5.svg"
                              alt="Minting..."
                              width={24}
                              height={24}
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

                    <div className="text-sm text-center">
                      <div className="text-gray-600">
                        
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-5">
                      Minting available until {formatDate(nftCollection.mintEndDate)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <MintSuccessModal
        isOpen={isMintSuccessOpen}
        // isOpen={true}
        onClose={() => setIsMintSuccessOpen(false)}
        nftImage={nftCollection.image}
        nftTitle={nftCollection.title}
        eventDate={`${formatDate(nftCollection.eventStartDate)} - ${formatDate(nftCollection.eventEndDate)}`}
      />
    </section>
  );
}
