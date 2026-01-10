"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlephiumConnectButton, useWallet } from '@alephium/web3-react'
import { useWalletLoading } from '@/context/WalletLoadingContext';
import Image from 'next/image';
import { addressFromContractId, DUST_AMOUNT, hexToString, number256ToNumber, ONE_ALPH, waitForTxConfirmation, web3 } from '@alephium/web3';
import { PoapCollection, PoapCollectionV2, PoapData, PoapNFT, PoapNFTSerieV2, PoapNFTV2, PoapSerieCollectionV2 } from 'my-contracts';
import Snackbar from '../ui/Snackbar';
import MediaDisplay from '../ui/MediaDisplay';
import { findTokenFromId, getTokenList, Token } from '@/services/utils';
import { truncateAddress } from '@/utils/stringUtils';
import CollectionModal, { Collection, NFTMetadata } from '../CollectionModal';

interface POAPResponse {
  contractId: string;
  collectionContractId: string;
  eventId?: number; // Present for series POAPs
  nftIndex: number;
  caller: string;
  createdAt: string;
  updatedAt?: string;
  isPublic?: boolean;
  hasParticipated?: boolean;
  collectionId?: string; // Legacy field, use collectionContractId instead
}

interface EventResponse {
  contractId: string;
  collectionContractId?: string; // Present for single events
  eventName: string;
  caller: string;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean; // From API response
  disabled?: boolean; // From API response
  image?: string; // Added by metadata fetch
  description?: string; // Added by metadata fetch
  eventDateStart?: string; // Added by metadata fetch
  eventDateEnd?: string; // Added by metadata fetch
  amountPaidPoap?: bigint; // Added by metadata fetch
  pricePoap?: bigint; // Added by metadata fetch
  isOpenPrice?: boolean; // Added by metadata fetch
  tokenSymbol?: string; // Added by metadata fetch
  tokenMetadata?: Token; // Added by metadata fetch
  // Series-specific fields
  seriesContractId?: string; // Present for series events
  eventId?: number; // Event index within series
  isSeries?: boolean; // Flag to distinguish series events
}

// Collection interface is now imported from CollectionModal

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

export default function NFTList({ account: connectedAccount }: { account: string | undefined }) {
  // Test mode: use test address if no account provided
  const testAddress = '1GBvuTs4TosNB9xTCGJL5wABn2xTYCzwa7MnXHphjcj1y';
  const actualAccount = connectedAccount || testAddress;
  const truncatedAccount = actualAccount ? actualAccount.slice(0, 4) + '...' + actualAccount.slice(-4) : '';
  const [showAllNFTs, setShowAllNFTs] = useState(false);
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [claimMessage, setClaimMessage] = useState("Link copied to clipboard!");
  const { account, signer } = useWallet();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [showAllCollections, setShowAllCollections] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  // Early return if no account is provided (but we have test address, so skip this)
  if (!actualAccount) {
    return (
      <section className="py-36 px-4 md:px-8 bg-lila-200">
        <div className="mx-auto max-w-7xl">
          <div className="bg-lila-200 p-8 rounded-xl">
            <div className="max-w-lg mx-auto text-center">
              <Image
                src="/images/blob5.svg"
                alt="No account"
                width={60}
                height={60}
                className="mx-auto mb-6 opacity-80"
                priority
              />
              <h3 className="text-2xl font-semibold text-black mb-4">
                Account Not Available
              </h3>
              <p className="text-gray-600 mb-8">
                Please connect your wallet to view your Presence NFTs.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const handleCollectionShare = async (e: React.MouseEvent, collectionId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/collections/#${collectionId}`;
    await navigator.clipboard.writeText(url);
    setClaimMessage("Collection link copied to clipboard!");
    setIsSnackbarOpen(true);
  };

  const handleSelectCollection = (collection: Collection) => {
    setSelectedCollection(collection);
  };

  const handleClosePanel = () => {
    setIsAnimatingOut(true)
    setTimeout(() => {
      setSelectedCollection(null)
      setIsAnimatingOut(false)
    }, 300) // Match animation duration
  };

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

  // Fetch series collections from user's owned series contracts
  useEffect(() => {
    const fetchSeriesCollections = async () => {
      if (!actualAccount) return;

      try {
        // Fetch user's series from API
        // According to API docs (line 484-502): GET /series/organizer/:address?limit=20
        // Returns all series collections created by a specific organizer
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'https://presenceprotocol.notrustverify.ch'}/api/series/organizer/${actualAccount}`
        );

        if (response.ok) {
          const seriesData = await response.json();

          // For each series, fetch its events/presences and stats
          const collectionsWithNFTs = await Promise.all(
            seriesData.map(async (series: any) => {
              try {
                // Fetch events in this series
                const eventsResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL ?? 'https://presenceprotocol.notrustverify.ch'}/api/series/${series.id}/events`
                );

                // Fetch presence stats for this series
                let statsMap: Record<number, { totalPresences: number; uniqueAttendees: number }> = {};
                try {
                  const statsResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL ?? 'https://presenceprotocol.notrustverify.ch'}/api/poap-serie/${series.contractId}/stats/events`
                  );
                  if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    if (statsData.events) {
                      statsData.events.forEach((stat: any) => {
                        statsMap[stat.eventId] = {
                          totalPresences: stat.totalPresences || 0,
                          uniqueAttendees: stat.uniqueAttendees || 0
                        };
                      });
                    }
                  }
                } catch (statsError) {
                  console.error('Error fetching series stats:', statsError);
                }

                if (eventsResponse.ok) {
                  const events = await eventsResponse.json();

                  const nftMetadata = events.map((event: any) => {
                    const eventStats = statsMap[event.eventId] || { totalPresences: 0, uniqueAttendees: 0 };
                    return {
                      title: event.eventName,
                      description: event.description || '',
                      image: event.image || '',
                      tokenId: `#${event.eventId}`,
                      eventDateStart: event.eventDateStart || '',
                      eventDateEnd: event.eventDateEnd || '',
                      collectionId: event.contractId,
                      eventId: event.eventId,
                      totalPresences: eventStats.totalPresences,
                      uniqueAttendees: eventStats.uniqueAttendees
                    };
                  });

                  return {
                    id: series.contractId,
                    name: series.name,
                    description: series.description,
                    nfts: nftMetadata,
                    isSeries: true
                  };
                }
              } catch (error) {
                console.error('Error fetching series events:', error);
              }

              return null;
            })
          );

          // Filter out null values and set collections
          const validCollections = collectionsWithNFTs.filter((c): c is Collection => c !== null);
          setCollections(validCollections);
        }
      } catch (error) {
        console.error('Error fetching series collections:', error);
        // Fall back to demo collections if API fails
        setCollections(demoCollections);
      }
    };

    fetchSeriesCollections();
  }, [actualAccount]);

  const demoCollections: Collection[] = [
    {
      id: 'collection-1',
      name: 'Alephium Dev Meetups 2024',
      description: 'A collection of presences from all Alephium developer meetups in 2024.',
      nfts: [
        {
          title: 'Zurich Meetup',
          description: 'First Alephium meetup in Zurich.',
          image: 'https://images.unsplash.com/photo-1599658880122-b43b6b1517b6?q=80&w=2940&auto=format&fit=crop',
          tokenId: '#1',
          eventDateStart: '15 Jan, 2024',
          eventDateEnd: '',
          collectionId: 'some-collection-id-1'
        },
        {
          title: 'Berlin Meetup',
          description: 'Alephium meetup in the heart of Berlin.',
          image: 'https://images.unsplash.com/photo-1552508744-1696344d2f34?q=80&w=2940&auto=format&fit=crop',
          tokenId: '#2',
          eventDateStart: '20 Mar, 2024',
          eventDateEnd: '',
          collectionId: 'some-collection-id-2'
        },
        {
          title: 'Paris Meetup',
          description: 'Croissants and smart contracts in Paris.',
          image: 'https://images.unsplash.com/photo-1502602898455-347376ba3be5?q=80&w=2942&auto=format&fit=crop',
          tokenId: '#3',
          eventDateStart: '10 May, 2024',
          eventDateEnd: '',
          collectionId: 'some-collection-id-3'
        },
        {
            title: 'Amsterdam Meetup',
            description: 'Canals and code in Amsterdam.',
            image: 'https://images.unsplash.com/photo-1583852223833-0498a3b83645?q=80&w=2940&auto=format&fit=crop',
            tokenId: '#4',
            eventDateStart: '12 Jul, 2024',
            eventDateEnd: '',
            collectionId: 'some-collection-id-4'
        }
      ]
    },
    {
      id: 'collection-2',
      name: 'NFT Workshop Series',
      description: 'Learn to build, mint, and trade NFTs on Alephium.',
      nfts: [
          {
              title: 'Intro to NFTs',
              description: 'Basics of Non-Fungible Tokens.',
              image: 'https://images.unsplash.com/photo-1639431682339-c050a6d3c347?q=80&w=2832&auto=format&fit=crop',
              tokenId: '#1',
              eventDateStart: '02 Feb, 2024',
              eventDateEnd: '',
              collectionId: 'some-collection-id-5'
          },
          {
            title: 'Minting your First NFT',
            description: 'A hands-on workshop on minting.',
            image: 'https://images.unsplash.com/photo-1642104253965-e7a6f02375b6?q=80&w=2940&auto=format&fit=crop',
            tokenId: '#2',
            eventDateStart: '09 Feb, 2024',
            eventDateEnd: '',
            collectionId: 'some-collection-id-6'
        },
      ]
    }
  ];

  useEffect(() => {
    if (!actualAccount) {
      setIsLoading(false);
      return;
    }
    
    web3.setCurrentNodeProvider(
      process.env.NEXT_PUBLIC_NODE_URL ?? "https://node.testnet.alephium.org",
      undefined,
      undefined
    );

    // Fetching all events for the account (both single events and series events)
    const fetchEvents = async () => {
      try {
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));
        // Use localhost in development if env var not set
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 
          (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://127.0.0.1:3000' 
            : 'https://presenceprotocol.notrustverify.ch');

        // Fetch single events
        const singleEventsUrl = `${baseUrl}/api/events/${actualAccount}?limit=50`;
        let singleEventsData: EventResponse[] = [];
        try {
          const singleResponse = await fetch(singleEventsUrl);
          if (singleResponse.ok) {
            const rawSingleEvents = await singleResponse.json();
            if (Array.isArray(rawSingleEvents)) {
              singleEventsData = rawSingleEvents.map((event: any) => ({
                ...event,
                isSeries: false,
                eventType: 'single',
              }));
            }
          }
        } catch (error) {
          console.error('Error fetching single events:', error);
        }

        // Fetch series events
        const seriesEventsUrl = `${baseUrl}/api/series/events/organizer/${actualAccount}?limit=50`;
        let seriesEventsData: EventResponse[] = [];
        try {
          const seriesResponse = await fetch(seriesEventsUrl);
          if (seriesResponse.ok) {
            const rawSeriesEvents = await seriesResponse.json();
            if (Array.isArray(rawSeriesEvents)) {
              seriesEventsData = rawSeriesEvents.map((event: any) => ({
                ...event,
                caller: event.organizer || event.caller,
                isSeries: true,
              }));
            }
          }
        } catch (error) {
          console.error('Error fetching series events:', error);
        }

        // Merge both event types
        const eventsData: EventResponse[] = [...singleEventsData, ...seriesEventsData];
        
        if (eventsData.length === 0) {
          setEvents([]);
          await minLoadingTime;
          return;
        }

        // Get token list - if it fails, continue with empty array
        let tokenList: Token[] = [];
        try {
          tokenList = await getTokenList();
        } catch (error) {
          // Continue with empty token list - events will still work, just without token metadata
        }

        // Helper to add timeout to contract state fetches
        const fetchWithTimeout = async <T,>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
          const timeout = new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error(`Contract fetch timeout after ${timeoutMs}ms`)), timeoutMs)
          );
          return Promise.race([promise, timeout]);
        };

        // Fetch collection metadata for each event
        const eventsWithMetadataResults = await Promise.allSettled(eventsData.map(async (event) => {
          // For series events, try multiple contract types
          if (event.isSeries) {
            try {
              const poapData = PoapData.at(addressFromContractId(event.contractId));
              const poapDataState = await fetchWithTimeout(poapData.fetchState(), 10000);
              return {
                ...event,
                contractId: event.contractId,
                amountPaidPoap: poapDataState.fields.amountPoapFees,
                pricePoap: poapDataState.fields.poapPrice,
                image: hexToString(poapDataState.fields.eventImage),
                description: hexToString(poapDataState.fields.description),
                eventDateStart: new Date(Number(poapDataState.fields.eventStartAt)).toLocaleDateString(),
                eventDateEnd: new Date(Number(poapDataState.fields.eventEndAt)).toLocaleDateString(),
                isOpenPrice: poapDataState.fields.isOpenPrice,
                tokenSymbol: poapDataState.fields.tokenIdPoap,
                tokenMetadata: findTokenFromId(tokenList, poapDataState.fields.tokenIdPoap),
              };
            } catch (poapDataError) {
              // Try PoapSerieCollectionV2
              try {
                const seriesContractId = event.seriesContractId || event.collectionContractId || event.contractId;
                const seriesCollection = PoapSerieCollectionV2.at(addressFromContractId(seriesContractId));
                const seriesState = await fetchWithTimeout(seriesCollection.fetchState(), 10000);
                return {
                  ...event,
                  contractId: event.contractId,
                  image: hexToString(seriesState.fields.collectionImage),
                  description: hexToString(seriesState.fields.collectionDescription),
                };
              } catch (seriesCollectionError) {
                // Try PoapNFTSerieV2
                try {
                  const seriesNFT = PoapNFTSerieV2.at(addressFromContractId(event.contractId));
                  const nftState = await fetchWithTimeout(seriesNFT.fetchState(), 10000);
                  return {
                    ...event,
                    contractId: event.contractId,
                    image: hexToString(nftState.fields.eventImage),
                    description: hexToString(nftState.fields.description),
                    eventDateStart: new Date(Number(nftState.fields.eventStartAt)).toLocaleDateString(),
                    eventDateEnd: new Date(Number(nftState.fields.eventEndAt)).toLocaleDateString(),
                  };
                } catch (nftError) {
                  return event;
                }
              }
            }
          }

          // For single events, try PoapCollectionV2 first
          try {
            const contractId = event.collectionContractId || event.contractId;
            const collectionV2 = PoapCollectionV2.at(addressFromContractId(contractId));
            const collectionMetadata = await fetchWithTimeout(collectionV2.fetchState(), 10000);
            const hasLockPresenceUntil = 'lockPresenceUntil' in collectionMetadata.fields;

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
              ...(hasLockPresenceUntil && { lockPresenceUntil: collectionMetadata.fields.lockPresenceUntil }),
            };
          } catch (v2Error) {
            // Try original PoapCollection
            try {
              const contractId = event.collectionContractId || event.contractId;
              const collection = PoapCollection.at(addressFromContractId(contractId));
              const collectionMetadata = await fetchWithTimeout(collection.fetchState(), 10000);
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
            } catch (v1Error) {
              return event;
            }
          }
        }));

        // Process Promise.allSettled results
        const eventsWithMetadata = eventsWithMetadataResults.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            return eventsData[index] || null;
          }
        }).filter((e): e is EventResponse => e !== null && e !== undefined);

        // Filter valid events - require contractId
        const validEvents = eventsWithMetadata.filter((e): e is EventResponse => 
          e !== null && e !== undefined && !!e.contractId
        );
        
        // Set events - use validEvents if available, otherwise use eventsData
        const eventsToSet = validEvents.length > 0 ? validEvents : 
          eventsData.filter((e): e is EventResponse => e !== null && e !== undefined && !!e.contractId);
        
        setEvents(eventsToSet);
        await minLoadingTime;
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      }
    };

    const fetchNFTs = async () => {
      try {
        // Create a minimum loading time promise
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://presenceprotocol.notrustverify.ch';

        // Fetch single event POAPs
        const singlePoapUrl = `${baseUrl}/api/poap/${actualAccount}?limit=50`;
        let singlePoapData: POAPResponse[] = [];
        try {
          const singleResponse = await fetch(singlePoapUrl);
          if (singleResponse.ok) {
            singlePoapData = await singleResponse.json();
          }
        } catch (e) {
          // Silently fail - will show empty state
        }

        // Fetch series POAPs
        const seriesPoapUrl = `${baseUrl}/api/poap-serie/${actualAccount}`;
        let seriesPoapData: POAPResponse[] = [];
        try {
          const seriesResponse = await fetch(seriesPoapUrl);
          if (seriesResponse.ok) {
            seriesPoapData = await seriesResponse.json();
          }
        } catch (e) {
          // Silently fail - will show empty state
        }

        // Merge both POAP types
        const poapData: POAPResponse[] = [...singlePoapData, ...seriesPoapData];

        if (poapData.length === 0) {
          setNfts([]);
          await minLoadingTime;
          return;
        }
        
        // Helper to add timeout to contract state fetches
        const fetchWithTimeout = async <T,>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
          const timeout = new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error(`Contract fetch timeout after ${timeoutMs}ms`)), timeoutMs)
          );
          return Promise.race([promise, timeout]);
        };
        
        // Helper to safely convert hex to string
        const safeHexToString = (hex: any): string => {
          if (!hex || typeof hex !== 'string') return '';
          try {
            return hexToString(hex);
          } catch (e) {
            return '';
          }
        };

        // Helper to extract NFT metadata from any contract state
        const extractNftMetadata = (fields: any, poap: POAPResponse) => {
          return {
            title: safeHexToString(fields.eventName) || `POAP #${poap.nftIndex}`,
            description: safeHexToString(fields.description),
            image: safeHexToString(fields.eventImage),
            tokenId: `#${poap.nftIndex}`,
            eventDateStart: fields.eventStartAt ? new Date(Number(fields.eventStartAt)).toLocaleDateString() : '',
            eventDateEnd: fields.eventEndAt ? new Date(Number(fields.eventEndAt)).toLocaleDateString() : '',
            collectionId: addressFromContractId(poap.contractId)
          };
        };

        // Fetch metadata for each POAP
        // Try different PoapNFT versions to find which one works
        const nftPromises = poapData.map(async (poap) => {
          const poapAddress = addressFromContractId(poap.contractId);

          // Try PoapNFTV2 first
          try {
            const nftV2 = PoapNFTV2.at(poapAddress);
            const metadataV2 = await fetchWithTimeout(nftV2.fetchState(), 10000);
            return extractNftMetadata(metadataV2.fields, poap);
          } catch (v2Error) {
            // Try original PoapNFT
            try {
              const nft = PoapNFT.at(poapAddress);
              const metadata = await fetchWithTimeout(nft.fetchState(), 10000);
              return extractNftMetadata(metadata.fields, poap);
            } catch (v1Error) {
              // Try PoapNFTSerieV2 (series NFT)
              try {
                const serieNFT = PoapNFTSerieV2.at(poapAddress);
                const serieMetadata = await fetchWithTimeout(serieNFT.fetchState(), 10000);
                return extractNftMetadata(serieMetadata.fields, poap);
              } catch (serieError) {
                // All types failed, return minimal object
              }
            }
          }

          // Return a minimal NFT object so the fetch doesn't fail completely
          return {
            title: `POAP #${poap.nftIndex}`,
            description: '',
            image: '',
            tokenId: `#${poap.nftIndex}`,
            eventDateStart: '',
            eventDateEnd: '',
            collectionId: addressFromContractId(poap.collectionContractId)
          };
        });

        const nftMetadata = await Promise.all(nftPromises);
        // Wait for both the data and minimum loading time
        await minLoadingTime;
        setNfts(nftMetadata);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setNfts([]);
      }
    };

    // Wrap fetch functions to ensure they always resolve
    const safeFetchNFTs = async () => {
      try {
        await fetchNFTs();
      } catch (error) {
        console.error('Unhandled error in fetchNFTs:', error);
        setNfts([]);
      }
    };

    const safeFetchEvents = async () => {
      try {
        await fetchEvents();
      } catch (error) {
        console.error('Unhandled error in fetchEvents:', error);
        setEvents([]);
      }
    };

    // Wait for both fetches to complete before setting loading to false
    // Add a timeout to ensure loading never gets stuck
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 30000); // 30 second timeout
    });

    Promise.race([
      Promise.all([safeFetchNFTs(), safeFetchEvents()]),
      timeoutPromise
    ])
      .finally(() => {
        setIsLoading(false);
      });
  }, [actualAccount]);


  // Helper function to truncate token address when no token metadata is available
  const getDisplayToken = (event: EventResponse) => {
    if (event.tokenMetadata) {
      return event.tokenMetadata.symbol;
    } else if (event.tokenSymbol) {
      // Don't show token if it's "0000"
      if (event.tokenSymbol === '0000' || event.tokenSymbol === '0000000000000000000000000000000000000000000000000000000000000000') {
        return '';
      }
      return truncateAddress(event.tokenSymbol)
    } else {
      return '';
    }
  };

  // Filter valid events
  const allEvents = events.filter(event => event && event.contractId);

  const displayedNFTs = showAllNFTs ? nfts : nfts.slice(0, 6);
  const displayedEvents = showAllEvents ? allEvents : allEvents.slice(0, 6);
  const displayedCollections = showAllCollections ? collections : collections.slice(0, 4);

  const handleShare = async (contractId: string, eventId?: number) => {
    let url = `${window.location.origin}/mint-presence/#id=${contractId}`;
    if (eventId !== undefined) {
      url += `&eventId=${eventId}`;
    }
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


  if (nfts.length === 0 && allEvents.length === 0 && collections.length === 0) {
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
                {allEvents.length} {allEvents.length === 1 ? 'Event' : 'Events'}
              </div>
            </div>
            {/* <Link
              className="text-black items-center shadow shadow-black text-xs font-semibold inline-flex px-4 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-2 rounded-lg h-10 focus:translate-y-1 hover:text-lila-800 tracking-wide"
              href="/new-event"
            >
              New Event <span className="ml-1">&rarr;</span>
            </Link> */}
          </div>

          {allEvents.length === 0 ? (
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
                    key={event.contractId || index}
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
                        <div className="flex items-center gap-2">
                          {getDisplayToken(event) && (
                            <div className="text-black items-center shadow shadow-lila-600 text-[10px] font-semibold inline-flex px-2 bg-lila-300 border-lila-600 border-2 py-1 rounded-lg tracking-wide">
                              {getDisplayToken(event)}
                            </div>
                          )}
                          {event.isSeries && (
                            <div className="text-black items-center shadow shadow-blue-400 text-[10px] font-semibold inline-flex px-2 bg-blue-100 border-blue-400 border-2 py-1 rounded-lg tracking-wide">
                              Series
                            </div>
                          )}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            if (event.isSeries && event.seriesContractId) {
                              handleShare(event.seriesContractId, event.eventId);
                            } else {
                              handleCollectionShare(e, event.contractId);
                            }
                          }}
                          className="mt-4 w-full text-black items-center shadow shadow-black text-xs font-semibold inline-flex px-4 justify-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-2 rounded-lg h-10 focus:translate-y-1 hover:text-lila-800 tracking-wide"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                            <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
                          </svg>
                          Share
                        </button>

                        <Link
                          href={event.isSeries && event.seriesContractId
                            ? `/mint-presence/#id=${addressFromContractId(event.seriesContractId)}&eventId=${event.eventId}`
                            : `/mint-presence/#id=${addressFromContractId(event.contractId)}`
                          }
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

              {allEvents.length > 6 && (
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

        {/* Collections Section */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-semibold text-black">Your Collections</h3>
              <div className="text-black items-center bg-lila-300 shadow shadow-lila-600 text-xs font-semibold inline-flex px-2  border-lila-600 border-2 py-1 rounded-lg tracking-wide">
                {collections.length} {collections.length === 1 ? 'Collection' : 'Collections'}
              </div>
            </div>
          </div>

          {collections.length === 0 ? (
            <div className="bg-lila-200 p-8 rounded-xl">
              <div className="max-w-lg mx-auto text-center">
                <h3 className="text-xl font-semibold text-black mb-4">
                  No Collections Yet
                </h3>
                <p className="text-gray-600">
                  Collections are groups of presences from multi-part events.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {displayedCollections.map((collection) => {
                  const topCardNft = collection.nfts?.[0];
                  const backgroundNfts = collection.nfts?.slice(1, 3) || [];
                  return (
                    <div
                      key={collection.id}
                      onClick={() => handleSelectCollection(collection)}
                      className="cursor-pointer group"
                    >
                      <div className="relative" style={{ aspectRatio: '3 / 4.2'}}>
                        {/* Background Cards */}
                        {backgroundNfts.reverse().map((nft, index) => (
                          <div
                            key={nft.tokenId}
                            className="absolute w-full h-full rounded-xl bg-white border-2 border-black overflow-hidden transition-transform duration-300 ease-in-out group-hover:rotate-0"
                            style={{
                              transform: `rotate(${index * 4 - 2}deg)`,
                              zIndex: index,
                            }}
                          >
                            <img src={nft.image} alt={nft.title} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {/* Top Card */}
                        <div
                          className="absolute w-full h-full rounded-xl bg-white border-2 border-black overflow-hidden transition-transform duration-300 ease-in-out group-hover:scale-105 flex flex-col"
                          style={{ zIndex: backgroundNfts.length }}
                        >
                           <div className="aspect-square w-full border-b-2 border-black overflow-hidden">
                              {topCardNft?.image ? (
                                  <img src={topCardNft.image} alt={collection.name} className="w-full h-full object-cover" />
                              ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-lila-100 to-lila-300">
                                    <span className="text-gray-500 text-sm text-center">No presences yet</span>
                                  </div>
                              )}
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                              <div>
                                <h3 className="text-base font-semibold text-black mb-1">{collection.name}</h3>
                                <p className="text-xs text-black mb-3 line-clamp-2">{collection.description}</p>
                              </div>
                              <div className="flex justify-between items-center pt-3 border-t-2 border-black mt-auto">
                                <div className="text-black items-center shadow shadow-lila-600 text-[10px] font-semibold inline-flex px-2 bg-lila-300 border-lila-600 border-2 py-1 rounded-lg tracking-wide">
                                  Collection
                                </div>
                                <button
                                  onClick={(e) => handleCollectionShare(e, collection.id)}
                                  className="text-black items-center shadow shadow-black text-[10px] font-semibold inline-flex px-2 bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 py-1 rounded-lg h-6 focus:translate-y-1 hover:text-lila-800 tracking-wide"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 mr-1">
                                    <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
                                  </svg>
                                  Share
                                </button>
                              </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {collections.length > 4 && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setShowAllCollections(!showAllCollections)}
                    className="text-black items-center shadow shadow-black text-base font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-2 rounded-lg h-12 focus:translate-y-1 hover:text-lila-800 tracking-wide"
                  >
                    {showAllCollections ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>


      </div>
      <CollectionModal
        isOpen={!!selectedCollection}
        onClose={handleClosePanel}
        collection={selectedCollection}
        isAnimatingOut={isAnimatingOut}
        handleShare={handleShare}
      />
      <Snackbar 
        message={claimMessage} 
        isOpen={isSnackbarOpen} 
        onClose={() => setIsSnackbarOpen(false)} 
      />
    </section>
  );
}
