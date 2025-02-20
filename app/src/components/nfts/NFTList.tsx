"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlephiumConnectButton, useWallet } from '@alephium/web3-react'
import { useWalletLoading } from '@/context/WalletLoadingContext';
import Image from 'next/image';
import { addressFromContractId, hexToString, web3 } from '@alephium/web3';
import { PoapCollection, PoapNFT } from 'my-contracts';
import Snackbar from '../ui/Snackbar';

interface NFTMetadata {
  title: string;
  description: string;
  image: string;
  tokenId: string;
  eventDateStart: string;
  eventDateEnd: string;
  collectionId: string;
}

interface POAPResponse {
  contractId: string;
  collectionContractId: string;
  nftIndex: number;
  caller: string;
  createdAt: string;
  updatedAt: string;
  collectionId: string;
}

interface EventResponse {
  contractId: string;
  eventName: string;
  caller: string;
  createdAt: string;
  updatedAt: string;
  image?: string;
  description?: string;
  eventDateStart?: string;
  eventDateEnd?: string;
}






export default function NFTList({ account }: { account: string }) {
  const truncatedAccount = account.slice(0, 4) + '...' + account.slice(-4);
  const [showAllNFTs, setShowAllNFTs] = useState(false);
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);



  useEffect(() => {
    console.log('Setting up node provider...');
    web3.setCurrentNodeProvider(
      process.env.NEXT_PUBLIC_NODE_URL ?? "https://node.testnet.alephium.org",
      undefined,
      undefined
    );
    console.log('Node provider setup complete');

    // Fetching all events for the account
    const fetchEvents = async () => {
      try {
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));

        const response = await fetch(`https://presenceprotocol.notrustverify.ch/api/events/${account}?limit=10`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const eventsData: EventResponse[] = await response.json();

        console.log('eventsData', eventsData);

        // Fetch collection metadata for each event
        const eventsWithMetadata = await Promise.all(eventsData.map(async (event) => {
          try {
            const collection = PoapCollection.at(addressFromContractId(event.contractId));
            const collectionMetadata = await collection.fetchState();
            console.log('collectionMetadata', collectionMetadata);
            return {
              ...event,
              image: hexToString(collectionMetadata.fields.eventImage),
              description: hexToString(collectionMetadata.fields.description),
              eventDateStart: new Date(Number(collectionMetadata.fields.eventStartAt)).toLocaleDateString(),
              eventDateEnd: new Date(Number(collectionMetadata.fields.eventEndAt)).toLocaleDateString(),
            };
          } catch (error) {
            console.error('Error fetching collection metadata:', error);
            return event;
          }
        }));

        setEvents(eventsWithMetadata);
        await minLoadingTime;
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };


    const fetchNFTs = async () => {
      try {
        // Create a minimum loading time promise
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));

        // Fetch POAP data
        const response = await fetch(`https://presenceprotocol.notrustverify.ch/api/poap/${account}`);
        const poapData: POAPResponse[] = await response.json();
        console.log('poapData', poapData);
        // Fetch metadata for each POAP
        const nftPromises = poapData.map(async (poap) => {
          const collection = PoapNFT.at(addressFromContractId(poap.contractId));
          console.log('collection', collection);
          const collectionMetadata = await collection.fetchState();

          return {
            title: hexToString(collectionMetadata.fields.eventName),
            description: hexToString(collectionMetadata.fields.description),
            image: hexToString(collectionMetadata.fields.eventImage),
            tokenId: `#${poap.nftIndex}`,
            eventDateStart: new Date(Number(collectionMetadata.fields.eventStartAt)).toLocaleDateString(),
            eventDateEnd: new Date(Number(collectionMetadata.fields.eventEndAt)).toLocaleDateString(),
            // contractAddress: addressFromContractId(collectionMetadata.contractId),
            collectionId: addressFromContractId(poap.collectionContractId)
          };
        });

        const nftMetadata = await Promise.all(nftPromises);
        // Wait for both the data and minimum loading time
        await Promise.all([minLoadingTime]);
        setNfts(nftMetadata);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
    fetchEvents();
  }, [account]);




  const displayedNFTs = showAllNFTs ? nfts : nfts.slice(0, 6);
  const displayedEvents = showAllEvents ? events : events.slice(0, 6);

  const handleShare = async (contractId: string) => {
    const url = `${window.location.origin}/mint-presence/#id=${contractId}`;
    await navigator.clipboard.writeText(url);
    setIsSnackbarOpen(true);
  };

  if (isLoading) {
    return (
      <section className="py-32 min-h-[calc(100vh-80px)] flex items-center justify-center px-4 md:px-8 bg-lila-200">
        <div className="mx-auto max-w-7xl flex flex-col my-auto items-center justify-center space-y-8">
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
          <div className="text-2xl font-semibold text-black/70">
            Loading your Presence...
          </div>
          <div style={{ marginTop: '10px' }} className="text-sm mt-0 pt-0 text-gray-500/70">
            Please wait while we fetch your event memories
          </div>
        </div>
      </section>
    );
  }

  console.log('nfts', nfts);
  console.log('events', events);

  if (nfts.length === 0 && events.length === 0) {
    return (
      <section className="py-36 px-4 md:px-8 bg-lila-200">
        <div className="mx-auto max-w-7xl">
          {/* <div className="flex items-center justify-center gap-4 mb-12">
            <h2 className="text-2xl lg:text-3xl font-semibold text-black text-center">
              Your Presence ({truncatedAccount})
            </h2>
          </div> */}

          <div className="bg-lila-200 p-8 rounded-xl">
          <div className="max-w-lg mx-auto text-center">
          <Image
                  src="/images/blob5.svg"
                  alt="No presences"
                  width={60}
                  height={60}
                  className="mx-auto mb-6 opacity-80"
                  priority
                />
              <h3 className="text-2xl font-semibold text-black mb-4">
                No Presence Yet
              </h3>
              <p className="text-gray-600 mb-8">
                Start your journey by exploring events or create your own to collect your first Presence NFT!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/events"
                  className="text-black items-center shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-lila-400 border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-3 rounded-lg h-12 focus:translate-y-1 hover:text-lila-800 tracking-wide"
                >
                  Explore Events <span className="ml-3">&rarr;</span>
                </Link>
                <Link
                  href="/new-event"
                  className="text-black items-center shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-3 rounded-lg h-12 focus:translate-y-1 hover:text-lila-800 tracking-wide"

                >
                  Create Event
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-4 md:px-8 bg-lila-200">
      <div className="mx-auto ">
        {/* <div className="flex items-center justify-center gap-4 mb-12">
          <h2 className="text-2xl lg:text-3xl font-semibold text-black text-center">
            Your Presence ({truncatedAccount})
          </h2>
     
        </div> */}


        <div className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-semibold text-black">Your Presences</h3>
              <div className="text-black items-center bg-lila-300 shadow shadow-lila-600 text-xs font-semibold inline-flex px-2  border-lila-600 border-2 py-1 rounded-lg tracking-wide">
                {nfts.length} {nfts.length === 1 ? 'Presence' : 'Presences'}
              </div>
            </div>
          </div>

          {nfts.length === 0 ? (
            <div className="bg-lila-200 p-8 rounded-xl">
              <div className="max-w-lg mx-auto text-center">
                <Image
                  src="/images/blob5.svg"
                  alt="No presences"
                  width={60}
                  height={60}
                  className="mx-auto mb-6 opacity-80"
                  priority
                />
                <h3 className="text-xl font-semibold text-black mb-4">
                  No Presences Collected Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by minting Presence from an event!
                </p>
                <Link
                  href="/events"
                  className="text-black items-center shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-3 rounded-lg h-12 focus:translate-y-1 hover:text-lila-800 tracking-wide"
                >
                  Explore Events <span className="ml-3">&rarr;</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedNFTs.map((nft, index) => (
                  <div
                    key={index}
                    className="border-2 border-black rounded-xl overflow-hidden bg-white shadow"
                  >
                    <div className="relative aspect-square overflow-hidden border-b-2 border-black">
                      <img
                        src={nft.image}
                        alt={nft.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleShare(nft.collectionId)}
                        className="absolute top-2 right-2 text-black items-center shadow shadow-black text-[10px] font-semibold inline-flex px-2 bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-1 rounded-lg h-6 focus:translate-y-1 hover:text-lila-800 tracking-wide"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 mr-1">
                          <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
                        </svg>
                        Share
                      </button>
                    </div>
                    <div className="p-4 pb-5  bg-white">
                      <h3 className="text-base font-semibold text-black mb-1">{nft.title}</h3>
                      <p className="text-xs text-black mb-3 line-clamp-2">{nft.description}</p>
                      <div className="flex justify-between items-center pt-3 border-t-2 border-black">
                        <div className="text-black items-center shadow shadow-lila-600 text-[10px] font-semibold inline-flex px-2 bg-lila-300 border-lila-600 border-2 py-1 rounded-lg tracking-wide">
                          {nft.tokenId}
                        </div>
                        <div className="text-xs text-black font-medium">
                          {nft.eventDateStart}
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
                    className="text-black items-center shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-2 rounded-lg h-12 focus:translate-y-1 hover:text-lila-800 tracking-wide"
                  >
                    {showAllNFTs ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Events Section */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-semibold text-black">Your Events</h3>
              <div className="text-black items-center bg-lila-300 shadow shadow-lila-600 text-xs font-semibold inline-flex px-2  border-lila-600 border-2 py-1 rounded-lg tracking-wide">
                {events.length} {events.length === 1 ? 'Event' : 'Events'}
              </div>
            </div>
            {/* <Link
              className="text-black items-center shadow shadow-black text-xs font-semibold inline-flex px-4 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-2 rounded-lg h-10 focus:translate-y-1 hover:text-lila-800 tracking-wide"
              href="/new-event"
            >
              New Event <span className="ml-1">&rarr;</span>
            </Link> */}
          </div>

          {events.length === 0 ? (
            <div className="bg-lila-200 p-8 rounded-xl">
              <div className="max-w-lg mx-auto text-center">
                <Image
                  src="/images/blob5.svg"
                  alt="No presences"
                  width={60}
                  height={60}
                  className="mx-auto mb-6 opacity-80"
                  priority
                />
                <h3 className="text-xl font-semibold text-black mb-4">
                  No Events Created Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first event and start building your community!
                </p>
                <Link
                  href="/new-event"
                  className="text-black items-center shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-lila-300 border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-3 rounded-lg h-12 focus:translate-y-1 hover:text-lila-800 tracking-wide"
                >
                  Create Event
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedEvents.map((event, index) => (
                  <div
                    key={index}
                    className="border-2 border-black rounded-xl overflow-hidden bg-white shadow"
                  >
                    {event.image && (
                      <div className="relative aspect-square overflow-hidden border-b-2 border-black">
                        <img
                          src={event.image}
                          alt={event.eventName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4 pb-5 bg-white">
                      <h3 className="text-base font-semibold text-black mb-1">{event.eventName}</h3>
                      {event.description && (
                        <p className="text-xs text-black mb-3 line-clamp-2">{event.description}</p>
                      )}
                      <div className="flex justify-between items-center pt-3 border-t-2 border-black">
                        <div className="text-black items-center shadow shadow-lila-600 text-[10px] font-semibold inline-flex px-2 bg-lila-300 border-lila-600 border-2 py-1 rounded-lg tracking-wide">
                          Event
                        </div>
                        <div className="text-xs text-black font-medium">
                          {event.eventDateStart && event.eventDateEnd ? (
                            `${event.eventDateStart} - ${event.eventDateEnd}`
                          ) : (
                            new Date(event.createdAt).toLocaleDateString()
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-4 pt-3">
                        <button
                          onClick={() => handleShare(addressFromContractId(event.contractId))}
                          className="mt-4 w-full text-black items-center shadow shadow-black text-xs font-semibold inline-flex px-4 justify-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-2 rounded-lg h-10 focus:translate-y-1 hover:text-lila-800 tracking-wide"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                            <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
                          </svg>
                          Share
                        </button>

                        <Link
                          href={`/mint-presence/#id=${addressFromContractId(event.contractId)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 w-full text-black items-center shadow shadow-black text-xs font-semibold inline-flex px-4 justify-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-2 rounded-lg h-10 focus:translate-y-1 hover:text-lila-800 tracking-wide"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>

                          Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {events.length > 6 && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setShowAllEvents(!showAllEvents)}
                    className="text-black items-center shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-2 rounded-lg h-12 focus:translate-y-1 hover:text-lila-800 tracking-wide"
                  >
                    {showAllEvents ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>





      </div>
      <Snackbar 
        message="Link copied to clipboard!" 
        isOpen={isSnackbarOpen} 
        onClose={() => setIsSnackbarOpen(false)} 
      />
    </section>
  );
}
