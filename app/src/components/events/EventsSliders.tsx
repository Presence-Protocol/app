'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ExplorerHeader from './EventsHeader';
import { useRouter } from 'next/navigation';
import { addressFromContractId, hexToString, web3 } from '@alephium/web3';
import { PoapCollection, PoapCollectionV2, PoapSerieCollectionV2, PoapData } from 'my-contracts';

interface Event {
  contractId: string;
  seriesContractId: string;
  eventId?: bigint;
  eventName: string;
  caller: string;
  createdAt: string;
  updatedAt: string;
  image?: string;
  description?: string;
  eventDateStart?: string;
  eventDateEnd?: string;
  pricePoap?: bigint;
  isOpenPrice?: boolean;
  lockPresenceUntil?: bigint;
  eventType?: 'series' | 'single';
  seriesId?: string;
  seriesName?: string;
}

interface SeriesCollection {
  id: string;
  name: string;
  description: string;
  image: string;
  eventCount: number;
  createdAt: string;
  isPublic: boolean;
}

interface EventMetadata {
  contractId: string;
  eventName: string;
  description?: string;
  image?: string;
  eventDateStart?: string;
  eventDateEnd?: string;
  createdAt: string;
}

type ViewMode = 'events' | 'series';

// Helper function to check if a URL is a video
const isVideoMedia = (src: string | null | undefined) => {
  if (!src) return false;
  const lower = src.toLowerCase();
  return (
    lower.startsWith('blob:') ||
    lower.startsWith('data:video') ||
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.ogg') ||
    lower.includes('video/mp4') ||
    lower.includes('video/webm') ||
    lower.includes('video/ogg')
  );
};

// Helper function to determine media type (video or image)
const getMediaType = async (url: string): Promise<'video' | 'image'> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    if (contentType?.startsWith('video/')) {
      return 'video';
    }
    // If content-type header is missing or not video, check the URL
    return isVideoMedia(response.url) ? 'video' : 'image';
  } catch (error) {
    console.error('Error checking media type:', error);
    // Fallback to checking the original URL
    return isVideoMedia(url) ? 'video' : 'image';
  }
};

export default function EventsSliders() {
  const [events, setEvents] = useState<Event[]>([]);
  const [seriesCollections, setSeriesCollections] = useState<SeriesCollection[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('events');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'https://presenceprotocol.notrustverify.ch'}/api/series?limit=50`,
          {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
          }
        );

        if (response.ok) {
          const seriesData = await response.json();

          // Enrich with contract state
          const enrichedSeries = await Promise.all(
            seriesData.map(async (series: any) => {
              try {
                const seriesContract = PoapSerieCollectionV2.at(addressFromContractId(series.contractId));
                const state = await seriesContract.fetchState();

                return {
                  id: series.contractId,
                  name: hexToString(state.fields.collectionName),
                  description: hexToString(state.fields.collectionDescription) || series.description || '',
                  image: hexToString(state.fields.collectionImage) || series.image || '',
                  eventCount: Number(state.fields.totalSupplySeries || 0),
                  createdAt: series.createdAt,
                  isPublic: series.isPublic || true
                };
              } catch (error) {
                console.error('Error fetching series contract:', error);
                return null;
              }
            })
          );

          const validSeries = enrichedSeries.filter((s): s is SeriesCollection => s !== null);
          setSeriesCollections(validSeries);
        }
      } catch (error) {
        console.error('Error fetching series:', error);
      }
    };

    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        web3.setCurrentNodeProvider(
          process.env.NEXT_PUBLIC_NODE_URL ?? "https://node.testnet.alephium.org"
        );

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'https://presenceprotocol.notrustverify.ch'}/api/events?limit=50`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Raw API events:', data.length, data);
        // Filter out only clearly test/dummy events, but allow legitimate events even if named "test"
        const filteredEvents = data.filter((event: Event) => 
          !['asdsad', 'ffd', 'asdas', 'sdd'].includes(event.eventName.toLowerCase())
        );
        console.log('Filtered events:', filteredEvents.length);

        const eventsWithMetadata = await Promise.all(filteredEvents.map(async (event: any) => {
          // Map isSeries to eventType if eventType is not set
          // API returns isSeries boolean, we need eventType: 'series' | 'single'
          const eventType = event.eventType || (event.isSeries ? 'series' : 'single');
          
          // Ensure eventType defaults to 'single' if not set
          const enrichedEvent: Event = {
            ...event,
            eventType: eventType,
          };
          
          console.log('Processing event:', event.eventName, 'eventType:', eventType, 'isSeries:', event.isSeries);
          
          // For series events, fetch from PoapData contract
          if (eventType === 'series' && event.contractId) {
            try {
              const poapData = PoapData.at(addressFromContractId(event.contractId));
              const poapDataState = await poapData.fetchState();
              return {
                ...enrichedEvent,
                image: hexToString(poapDataState.fields.eventImage),
                description: hexToString(poapDataState.fields.description),
                eventDateStart: new Date(Number(poapDataState.fields.eventStartAt)).toLocaleDateString(),
                eventDateEnd: new Date(Number(poapDataState.fields.eventEndAt)).toLocaleDateString(),
                pricePoap: poapDataState.fields.poapPrice,
                isOpenPrice: poapDataState.fields.isOpenPrice,
              };
            } catch (poapDataError) {
              console.warn('Error fetching PoapData for series event:', event.eventName, poapDataError);
              // Fall through to try collection contracts as fallback
            }
          }
          
          // For single events, fetch from collection contracts
          try {
            // Try PoapCollectionV2 first
            const collectionV2 = PoapCollectionV2.at(addressFromContractId(event.contractId));
            const collectionMetadata = await collectionV2.fetchState();
            
            // Check if lockPresenceUntil exists in the contract state
            const hasLockPresenceUntil = 'lockPresenceUntil' in collectionMetadata.fields;
            console.log(collectionMetadata.fields);
            return {
              ...enrichedEvent,
              image: hexToString(collectionMetadata.fields.eventImage),
              description: hexToString(collectionMetadata.fields.description),
              eventDateStart: new Date(Number(collectionMetadata.fields.eventStartAt)).toLocaleDateString(),
              eventDateEnd: new Date(Number(collectionMetadata.fields.eventEndAt)).toLocaleDateString(),
              pricePoap: collectionMetadata.fields.poapPrice,
              isOpenPrice: collectionMetadata.fields.isOpenPrice,
              ...(hasLockPresenceUntil && { lockPresenceUntil: collectionMetadata.fields.lockPresenceUntil }),
            };
          } catch (error) {
            // If V2 fails, try original PoapCollection
            try {
              const collection = PoapCollection.at(addressFromContractId(event.contractId));
              const collectionMetadata = await collection.fetchState();
              return {
                ...enrichedEvent,
                image: hexToString(collectionMetadata.fields.eventImage),
                description: hexToString(collectionMetadata.fields.description),
                eventDateStart: new Date(Number(collectionMetadata.fields.eventStartAt)).toLocaleDateString(),
                eventDateEnd: new Date(Number(collectionMetadata.fields.eventEndAt)).toLocaleDateString(),
                pricePoap: collectionMetadata.fields.poapPrice,
                isOpenPrice: collectionMetadata.fields.isOpenPrice,
              };
            } catch (innerError) {
              // Silently ignore errors for contracts that can't be fetched
              console.warn('Error fetching collection metadata for event:', event.eventName, innerError);
              return enrichedEvent;
            }
          }
        }));

        // Filter out any null/undefined events (shouldn't happen, but just in case)
        const validEvents = eventsWithMetadata.filter((e): e is Event => e !== null && e !== undefined);
        console.log('Final events count:', validEvents.length);
        console.log('Events by type:', {
          series: validEvents.filter(e => e.eventType === 'series').length,
          single: validEvents.filter(e => e.eventType === 'single').length,
          undefined: validEvents.filter(e => !e.eventType).length
        });
        
        setEvents(validEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
    fetchSeries();
    const intervalId = setInterval(() => {
      fetchEvents();
      fetchSeries();
    }, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const last24Hours = events.filter(e => 
    new Date(e.createdAt) > new Date(Date.now() - 24*60*60*1000)
  ).length;

  if (isLoading) {
    return <ExplorerHeader totalEvents={0} last24Hours={0} />;
  }

  if (error) {
    return (
      <>
        <ExplorerHeader totalEvents={0} last24Hours={0} />
        <div className="mt-12 text-center">
          <div className="text-red-600 items-center mb-4 shadow shadow-black text-xs font-semibold inline-flex px-4 bg-red-100 border-black border-2 py-2 rounded-lg tracking-wide">
            {error}
          </div>
        </div>
      </>
    );
  }

  const displayEvents = events.slice(0, 50);

  return (
    <div className="mx-auto bg-lila-200 pb-24">
      <ExplorerHeader totalEvents={events.length} last24Hours={last24Hours} />

      {/* View Mode Toggle */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setViewMode('events')}
            className={`text-black items-center shadow shadow-black text-sm font-semibold inline-flex px-6 focus:outline-none justify-center text-center border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 py-2 rounded-lg h-10 focus:translate-y-1 tracking-wide ${
              viewMode === 'events' ? 'bg-lila-400 text-lila-900' : 'bg-white hover:bg-lila-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
              Events ({events.length})
          </button>
          <button
            onClick={() => setViewMode('series')}
            className={`text-black items-center shadow shadow-black text-sm font-semibold inline-flex px-6 focus:outline-none justify-center text-center border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 py-2 rounded-lg h-10 focus:translate-y-1 tracking-wide ${
              viewMode === 'series' ? 'bg-lila-400 text-lila-900' : 'bg-white hover:bg-lila-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122" />
            </svg>
            Event Series ({seriesCollections.length})
          </button>
        </div>
      </div>

      <div className="space-y-24 py-8 px-8 max-w-7xl mx-auto">
        {viewMode === 'events' ? (
          <EventSection
            title="All Events"
            events={displayEvents}
            viewAllLink="/events/all"
          />
        ) : (
          <SeriesSection
            title="Event Series Collections"
            series={seriesCollections}
          />
        )}
      </div>
    </div>
  );
}

function EventSection({ title, events, viewAllLink }: {
  title: string;
  events: Event[];
  viewAllLink: string;
}) {
  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {events.length > 51 && (
          <div className="text-black items-center shadow shadow-black text-xs font-semibold inline-flex px-4 bg-white border-black border-2 py-2 rounded-lg tracking-wide">
            <Link href={viewAllLink}>View All</Link>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {events.map((event) => (
          <EventCard key={event.contractId} event={event} />
        ))}
      </div>
    </div>
  );
}

function SeriesSection({ title, series }: {
  title: string;
  series: SeriesCollection[];
}) {
  if (series.length === 0) {
    return (
      <div className="relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="text-center py-16 bg-lila-100 rounded-2xl border-2 border-black">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122" />
          </svg>
          <h3 className="text-lg font-semibold text-black mb-2">No Event Series Yet</h3>
          <p className="text-gray-600 text-sm">Event series will appear here once organizers create them</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {series.map((seriesItem) => (
          <SeriesCard key={seriesItem.id} series={seriesItem} />
        ))}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const router = useRouter();
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'video' | 'image'>('image');
  const [mediaError, setMediaError] = useState(false);
  
  useEffect(() => {
    const checkMediaType = async () => {
      if (event.image) {
        try {
          const type = await getMediaType(event.image);
          setMediaType(type);
        } catch (error) {
          console.error('Error determining media type:', error);
          setMediaType('image');
        }
      }
    };
    
    checkMediaType();
  }, [event.image]);

  const handleClick = () => {
    if (event.eventType === 'series' && event.seriesContractId !== undefined && event.eventId !== undefined) {
      router.push(`/mint-presence/#id=${addressFromContractId(event.seriesContractId)}&eventId=${event.eventId}`);
    } else {
      router.push(`/mint-presence/#id=${addressFromContractId(event.contractId)}`);
    }
  };

  const handleShare = async () => {
    let url: string;
    if (event.eventType === 'series' && event.seriesContractId !== undefined && event.eventId !== undefined) {
      url = `${window.location.origin}/mint-presence/#id=${addressFromContractId(event.seriesContractId)}&eventId=${event.eventId}`;
    } else {
      url = `${window.location.origin}/mint-presence/#id=${addressFromContractId(event.contractId)}`;
    }
    await navigator.clipboard.writeText(url);
    setIsSnackbarOpen(true);
  };

  const renderMedia = () => {
    const fallbackContent = (
      <div className="w-full h-full bg-lila-500 flex flex-col items-center justify-center p-2">
        <span className="text-sm font-medium text-black">
          {event.eventName}
        </span>
        <span className="text-xs text-black mt-1">
          {event.eventDateStart} - {event.eventDateEnd}
        </span>
      </div>
    );

    if (!event.image) {
      return fallbackContent;
    }

    if (mediaType === 'video') {
      return (
        <div className="relative w-full h-full">
          <video
            key={event.image}
            src={event.image}
            className="w-full h-full object-cover"
            autoPlay={true}
            loop={true}
            muted
            playsInline
            controls={false}
            onError={(e) => {
              console.error('Video error:', e);
              setMediaError(true);
            }}
          />
          {mediaError && fallbackContent}
        </div>
      );
    }

    return (
      <div className="relative w-full h-full">
        <img
          src={event.image}
          alt={event.eventName}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Image error:', e);
            setMediaError(true);
          }}
        />
        {mediaError && fallbackContent}
      </div>
    );
  };

  return (
    <div className="border-2 border-black rounded-xl overflow-hidden bg-white shadow">
      <div className="relative aspect-square overflow-hidden border-b-2 border-black">
        {renderMedia()}
        <button
          onClick={handleShare}
          className="absolute top-2 right-2 text-black items-center shadow-small shadow-black text-[10px] font-semibold inline-flex px-2 bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 py-1 rounded-lg h-6 focus:translate-y-1 hover:text-lila-800 tracking-wide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 mr-1">
            <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
          </svg>
          Share
        </button>
      </div>
      <div className="p-4 pb-5 bg-white flex flex-col">
        <h3 className="text-base font-semibold text-black mb-1 h-[48px] line-clamp-2">{event.eventName}</h3>
        <div className="mb-3 min-h-[32px]">
          {event.description && (
            <p className="text-xs text-black line-clamp-2">{event.description}</p>
          )}
        </div>
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
        <button
          onClick={handleClick}
          className="mt-4 w-full text-black items-center shadow shadow-black text-xs font-semibold inline-flex px-4 justify-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 py-2 rounded-lg h-10 focus:translate-y-1 hover:text-lila-800 tracking-wide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          View Event
        </button>
      </div>
      
      {isSnackbarOpen && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Link copied to clipboard!
          <button 
            onClick={() => setIsSnackbarOpen(false)}
            className="ml-3 text-white hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function SeriesCard({ series }: { series: SeriesCollection }) {
  const router = useRouter();
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  const handleClick = () => {
    // Navigate to series detail page or first event in series
    router.push(`/series/#id=${addressFromContractId(series.id)}`);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/series/#id=${addressFromContractId(series.id)}`;
    await navigator.clipboard.writeText(url);
    setIsSnackbarOpen(true);
  };

  return (
    <div className="border-2 border-black rounded-xl overflow-hidden bg-white shadow">
      <div className="relative aspect-square overflow-hidden border-b-2 border-black">
        {series.image ? (
          <img
            src={series.image}
            alt={series.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-lila-100 to-lila-300">
            <h4 className="text-xl font-semibold text-black text-center mb-2">{series.name}</h4>
            {series.createdAt && (
              <p className="text-sm text-gray-600 text-center">
                {new Date(series.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={handleShare}
            className="text-black items-center shadow-small shadow-black text-[10px] font-semibold inline-flex px-2 bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 py-1 rounded-lg h-6 focus:translate-y-1 hover:text-lila-800 tracking-wide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 mr-1">
              <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
            </svg>
            Share
          </button>
        </div>
        <div className="absolute bottom-2 left-2">
          <div className="text-black items-center shadow shadow-lila-600 text-[10px] font-semibold inline-flex px-2 bg-lila-300 border-lila-600 border-2 py-1 rounded-lg tracking-wide">
            {series.eventCount} {series.eventCount === 1 ? 'Event' : 'Events'}
          </div>
        </div>
      </div>
      <div className="p-4 pb-5 bg-white flex flex-col">
        <h3 className="text-base font-semibold text-black mb-1 h-[48px] line-clamp-2">{series.name}</h3>
        <div className="mb-3 min-h-[32px]">
          {series.description && (
            <p className="text-xs text-black line-clamp-2">{series.description}</p>
          )}
        </div>
        <div className="flex justify-between items-center pt-3 border-t-2 border-black">
          <div className="text-black items-center shadow shadow-lila-600 text-[10px] font-semibold inline-flex px-2 bg-lila-300 border-lila-600 border-2 py-1 rounded-lg tracking-wide">
            Series
          </div>
          <div className="text-xs text-black font-medium">
            {new Date(series.createdAt).toLocaleDateString()}
          </div>
        </div>
        <button
          onClick={handleClick}
          className="mt-4 w-full text-black items-center shadow shadow-black text-xs font-semibold inline-flex px-4 justify-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 py-2 rounded-lg h-10 focus:translate-y-1 hover:text-lila-800 tracking-wide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          View Series
        </button>
      </div>

      {isSnackbarOpen && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Link copied to clipboard!
          <button
            onClick={() => setIsSnackbarOpen(false)}
            className="ml-3 text-white hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}