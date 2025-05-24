"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlephiumConnectButton, useWallet } from '@alephium/web3-react'
import { useWalletLoading } from '@/context/WalletLoadingContext';
import Image from 'next/image';
import { addressFromContractId, DUST_AMOUNT, hexToString, number256ToNumber, ONE_ALPH, waitForTxConfirmation, web3 } from '@alephium/web3';
import { PoapCollection, PoapNFT } from 'my-contracts';
import Snackbar from '../ui/Snackbar';
import { findTokenFromId, getTokenList, Token } from '@/services/utils';
import { truncateAddress } from '@/utils/stringUtils';

// Video file extensions
const VIDEO_EXTENSIONS: string[] = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];

// Helper function to check media type
const getMediaType = async (url: string): Promise<'video' | 'image'> => {
  try {
    console.log('Checking media type for URL:', url);
    
    // First check if the URL ends with common video extensions
    if (VIDEO_EXTENSIONS.some((ext: string) => url.toLowerCase().endsWith(ext))) {
      console.log('Detected video by extension');
      return 'video';
    }

    // Check for Google thumbnail URLs and extract original URL if possible
    if (url.includes('encrypted-tbn') && url.includes('gstatic.com')) {
      console.log('Detected Google thumbnail URL, treating as image');
      return 'image';
    }

    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    const contentType = response.headers.get('content-type');
    console.log('Content type from HEAD request:', contentType);
    
    // Check if it's a video content type
    if (contentType?.startsWith('video/')) {
      console.log('Detected video by content-type');
      return 'video';
    }

    // Additional check for video content type variations
    if (contentType?.includes('video') || 
        contentType?.includes('media') ||
        contentType?.includes('stream')) {
      console.log('Detected video from extended content-type check');
      return 'video';
    }
    
    console.log('Defaulting to image type');
    return 'image';
  } catch (error) {
    console.error('Error checking media type:', error);
    // If we can't check, try to guess from the URL
    const url_lower = url.toLowerCase();
    if (VIDEO_EXTENSIONS.some((ext: string) => url_lower.endsWith(ext))) {
      console.log('Fallback: Detected video from URL extension');
      return 'video';
    }
    console.log('Fallback: Defaulting to image type');
    return 'image';
  }
};

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
  amountPaidPoap?: bigint;
  pricePoap?: bigint;
  isOpenPrice?: boolean;
  tokenSymbol?: string;
  tokenMetadata?: Token;
}

interface MediaDisplayProps {
  url: string;
  alt: string;
  title: string;
  eventDateStart?: string;
  eventDateEnd?: string;
}

function MediaDisplay({ url, alt, title, eventDateStart, eventDateEnd }: MediaDisplayProps) {
  const [mediaType, setMediaType] = useState<'video' | 'image'>('image');
  const [mediaError, setMediaError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMediaType = async () => {
      try {
        setIsLoading(true);
        const type = await getMediaType(url);
        console.log('Media type determined:', type, 'for URL:', url);
        setMediaType(type);
      } catch (error) {
        console.error('Error determining media type:', error);
        setMediaType('image');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkMediaType();
  }, [url]);

  const fallbackContent = (
    <div className="w-full h-full bg-lila-500 flex flex-col items-center justify-center p-2">
      <span className="text-sm font-medium text-black">
        {title}
      </span>
      <span className="text-xs text-black mt-1">
        {eventDateStart} - {eventDateEnd}
      </span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full h-full bg-lila-300 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (mediaError) {
    return fallbackContent;
  }

  if (mediaType === 'video') {
    console.log('Rendering video component for URL:', url);
    return (
      <div className="relative w-full h-full">
        <video
          key={url}
          src={url}
          className="w-full h-full object-cover"
          autoPlay={true}
          loop={true}
          muted
          playsInline
          controls={false}
          onLoadStart={() => {
            console.log('Video load started:', url);
          }}
          onLoadedMetadata={(e) => {
            const video = e.target as HTMLVideoElement;
            console.log('Video metadata loaded:', {
              duration: video.duration,
              width: video.videoWidth,
              height: video.videoHeight,
              url: url
            });
          }}
          onError={(e) => {
            const video = e.target as HTMLVideoElement;
            console.error('Video error:', {
              error: e,
              networkState: video.networkState,
              readyState: video.readyState,
              errorCode: video.error?.code,
              errorMessage: video.error?.message,
              url: url
            });
            setMediaError(true);
          }}
          onPlay={() => {
            console.log('Video started playing:', url);
          }}
        />
        {mediaError && fallbackContent}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <img
        src={url}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error('Image error:', e);
          setMediaError(true);
        }}
        onLoad={() => {
          console.log('Image loaded successfully:', url);
        }}
      />
      {mediaError && fallbackContent}
    </div>
  );
}

// Helper function to humanize amounts with K, M, B suffixes for large numbers
const humanizeAmount = (amount: bigint, decimals: number = 18): string => {
  // Convert bigint to a decimal number with proper decimal places
  const numericAmount = number256ToNumber(amount, decimals);
  
  // Define thresholds and corresponding suffixes
  const thresholds = [
    { value: 1e12, suffix: 'T' },  // Trillion
    { value: 1e9, suffix: 'B' },   // Billion
    { value: 1e6, suffix: 'M' },   // Million
    { value: 1e3, suffix: 'K' }    // Thousand
  ];
  
  // Find the appropriate threshold
  for (const { value, suffix } of thresholds) {
    if (numericAmount >= value) {
      // Format with 1 decimal place and add suffix
      const formatted = (numericAmount / value).toFixed(1);
      // Remove trailing .0 if present
      return formatted.endsWith('.0') 
        ? formatted.slice(0, -2) + suffix 
        : formatted + suffix;
    }
  }
  // For small numbers, format with up to 2 decimal places
  const formatted = numericAmount.toFixed(2);
  // Remove trailing zeros and decimal point if not needed
  return formatted.replace(/\.?0+$/, '');
};

export default function NFTList({ account: connectedAccount }: { account: string }) {
  const truncatedAccount = connectedAccount.slice(0, 4) + '...' + connectedAccount.slice(-4);
  const [showAllNFTs, setShowAllNFTs] = useState(false);
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [claimMessage, setClaimMessage] = useState("Link copied to clipboard!");
  const { account, signer } = useWallet();

  const handleClaim = async (e: React.FormEvent, collectionContractId: string) => {
    e.preventDefault();

    try {
      if (!signer) {
        throw new Error('Signer not available')
      }
      if (!collectionContractId) {
        throw new Error('Collection contract not initialized')
      }

      const collection = PoapCollection.at(addressFromContractId(collectionContractId));
      const feesAmount = (await collection.view.getAmountPoapFees()).returns

      const result = await collection.transact.claimFunds({
        args: {
          amountToClaim: feesAmount
        },
        signer: signer,
        attoAlphAmount: DUST_AMOUNT
      });

      await waitForTxConfirmation(result.txId, 1, 5 * 1000);
      
      // Update the events data after successful claim
      setClaimMessage("Funds claimed successfully!");
      setIsSnackbarOpen(true);
      
      // Update the specific event in the state
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (addressFromContractId(event.contractId) === addressFromContractId(collectionContractId)) {
            return {
              ...event,
              amountPaidPoap: 0n
            };
          }
          return event;
        })
      );
      
    } catch (error: any) {
      console.error('Error claiming funds:', error);
      setClaimMessage("Failed to claim funds. Please try again.");
      setIsSnackbarOpen(true);
    }
  }

  useEffect(() => {
    // console.log('Setting up node provider...');
    web3.setCurrentNodeProvider(
      process.env.NEXT_PUBLIC_NODE_URL ?? "https://node.testnet.alephium.org",
      undefined,
      undefined
    );
    // console.log('Node provider setup complete');

    // Fetching all events for the account
    const fetchEvents = async () => {
      try {
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'https://presenceprotocol.notrustverify.ch'}/api/events/${connectedAccount}?limit=10`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const eventsData: EventResponse[] = await response.json();

        const tokenList = await getTokenList();

        // Fetch collection metadata for each event
        const eventsWithMetadata = await Promise.all(eventsData.map(async (event) => {
          try {
            const collection = PoapCollection.at(addressFromContractId(event.contractId));
            const collectionMetadata = await collection.fetchState();
            return {
              ...event,
              contractId: event.contractId,
              amountPaidPoap: collectionMetadata.fields.amountPoapFees,
              pricePoap: collectionMetadata.fields.poapPrice,
              image: hexToString(collectionMetadata.fields.eventImage),
              description: hexToString(collectionMetadata.fields.description),
              eventDateStart: new Date(Number(collectionMetadata.fields.eventStartAt)).toLocaleDateString(),
              eventDateEnd: new Date(Number(collectionMetadata.fields.eventEndAt)).toLocaleDateString(),
              isOpenPrice: collectionMetadata.fields.isOpenPrice,
              tokenSymbol: collectionMetadata.fields.tokenIdPoap,
              tokenMetadata: findTokenFromId(tokenList, collectionMetadata.fields.tokenIdPoap),
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
        const response = await fetch(`https://presenceprotocol.notrustverify.ch/api/poap/${connectedAccount}`);
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
  }, [connectedAccount]);

  // Helper function to truncate token address when no token metadata is available
  const getDisplayToken = (event: EventResponse) => {
    if (event.tokenMetadata) {
      return event.tokenMetadata.symbol;
    } else if (event.tokenSymbol) {
      return truncateAddress(event.tokenSymbol)
    } else {
      return '';
    }
  };

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

  // console.log('nfts', nfts);
  // console.log('events', events);

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
                      {nft.image ? (
                        <MediaDisplay
                          url={nft.image}
                          alt={nft.title}
                          title={nft.title}
                          eventDateStart={nft.eventDateStart}
                          eventDateEnd={nft.eventDateEnd}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-lila-100 to-lila-300">
                          <h4 className="text-xl font-semibold text-black text-center mb-2">{nft.title}</h4>
                          <p className="text-sm text-gray-600 text-center">
                            {nft.eventDateStart && nft.eventDateEnd ? (
                              `${nft.eventDateStart} - ${nft.eventDateEnd}`
                            ) : (
                              nft.eventDateStart
                            )}
                          </p>
                        </div>
                      )}
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
                          {nft.eventDateStart && nft.eventDateEnd ? (
                            `${nft.eventDateStart} - ${nft.eventDateEnd}`
                          ) : (
                            nft.eventDateStart
                          )}
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
                    <div className="relative aspect-square overflow-hidden border-b-2 border-black">
                      {event.image ? (
                        <MediaDisplay
                          url={event.image}
                          alt={event.eventName}
                          title={event.eventName}
                          eventDateStart={event.eventDateStart}
                          eventDateEnd={event.eventDateEnd}
                        />
                      ) : (
                        <div className="w-full h-full bg-lila-500 flex flex-col items-center justify-center p-2">
                          <span className="text-sm font-medium text-black">
                            {event.eventName}
                          </span>
                          <span className="text-xs text-black mt-1">
                            {event.eventDateStart} - {event.eventDateEnd}
                          </span>
                        </div>
                      )}
                      {(event.pricePoap && event.pricePoap > 0n || event.isOpenPrice) && (
                        <button
                          disabled={(event.amountPaidPoap !== undefined && event.amountPaidPoap <= 0n)}
                          onClick={(e) => handleClaim(e, event.contractId)}
                          className={`absolute top-2 right-2 text-black items-center shadow shadow-black text-[10px] font-semibold inline-flex px-2 ${(event.amountPaidPoap !== undefined && event.amountPaidPoap <= 0n) ? 'bg-gray-200 opacity-60 cursor-not-allowed' : 'bg-lila-300 hover:text-lila-800'} border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 py-1 rounded-lg h-6 focus:translate-y-1 tracking-wide`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
                          </svg>
                          Claim
                        </button>
                      )}
                    </div>
                    <div className="p-4 pb-5 bg-white">
                      <h3 className="text-base font-semibold text-black mb-1">{event.eventName}</h3>
                      {event.description && (
                        <p className="text-xs text-black mb-3 line-clamp-2">{event.description}</p>
                      )}
                      <div className="flex justify-between items-center pt-3 border-t-2 border-black">
                        <div className="text-black items-center shadow shadow-lila-600 text-[10px] font-semibold inline-flex px-2 bg-lila-300 border-lila-600 border-2 py-1 rounded-lg tracking-wide">
                          {getDisplayToken(event)}
                        </div>
                        <div className="text-xs text-black font-medium">
                          {event.eventDateStart && event.eventDateEnd ? (
                            `${event.eventDateStart} - ${event.eventDateEnd}`
                          ) : (
                            new Date(event.createdAt).toLocaleDateString()
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center gap-4 ">
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
                      {/* {(event.pricePoap && event.pricePoap > 0n || event.isOpenPrice) && (
                        <button
                          disabled={(event.amountPaidPoap !== undefined && event.amountPaidPoap <= 0n )}
                          onClick={(e) => handleClaim(e, event.contractId)}
                          className={`mt-4 w-full text-black items-center shadow shadow-black text-xs font-semibold inline-flex px-4 justify-center ${(event.amountPaidPoap !== undefined && event.amountPaidPoap <= 0n) ? 'bg-gray-200 opacity-60 cursor-not-allowed' : 'bg-lila-300 hover:text-lila-800'} border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 py-2 rounded-lg h-10 focus:translate-y-1 tracking-wide`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
                          </svg>
                          Claim {event.amountPaidPoap !== undefined && `${humanizeAmount(event.amountPaidPoap, event.tokenMetadata?.decimals ?? 18)} ${getDisplayToken(event)}`}
                        </button>
                      )} */}
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
        message={claimMessage} 
        isOpen={isSnackbarOpen} 
        onClose={() => setIsSnackbarOpen(false)} 
      />
    </section>
  );
}
