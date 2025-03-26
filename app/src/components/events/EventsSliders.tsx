'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ExplorerHeader from './EventsHeader';
import { useRouter } from 'next/navigation';
import { addressFromContractId, hexToString, web3 } from '@alephium/web3';
import EventSlider from '../nfts/EventSlider';
import { PoapCollection } from 'my-contracts';

interface Event {
  contractId: string;
  eventName: string;
  caller: string;
  createdAt: string;
  updatedAt: string;
  eventType?: 'free' | 'premium' | 'live';
  image?: string;
  description?: string;
  eventDateStart?: string;
  eventDateEnd?: string;
  pricePoap?: bigint;
  isOpenPrice?: boolean;
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

export default function EventsSliders() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        web3.setCurrentNodeProvider(
          process.env.NEXT_PUBLIC_NODE_URL ?? "https://node.testnet.alephium.org"
        );

        const response = await fetch('https://presenceprotocol.notrustverify.ch/api/events?limit=50', {
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
        const filteredEvents = data.filter((event: Event) => 
          !['test', 'asdsad', 'ffd', 'asdas', 'sdd'].includes(event.eventName.toLowerCase())
        );

        const eventsWithMetadata = await Promise.all(filteredEvents.map(async (event: Event) => {
          try {
            const collection = PoapCollection.at(addressFromContractId(event.contractId));
            const collectionMetadata = await collection.fetchState();
            
            return {
              ...event,
              image: hexToString(collectionMetadata.fields.eventImage),
              description: hexToString(collectionMetadata.fields.description),
              eventDateStart: new Date(Number(collectionMetadata.fields.eventStartAt)).toLocaleDateString(),
              eventDateEnd: new Date(Number(collectionMetadata.fields.eventEndAt)).toLocaleDateString(),
              pricePoap: collectionMetadata.fields.poapPrice,
              isOpenPrice: collectionMetadata.fields.isOpenPrice,
            };
          } catch (error) {
            console.error('Error fetching collection metadata:', error);
            return event;
          }
        }));

        setEvents(eventsWithMetadata);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
    const intervalId = setInterval(fetchEvents, 5 * 60 * 1000);
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

  // Mock categorization - replace with actual logic based on your event properties
  const liveEvents = events.slice(0, 4);
  const premiumEvents = events.slice(4, 8);
  const freeEvents = events.slice(8, 12);

  return (
    <div className="mx-auto bg-lila-200 pb-24">
      <ExplorerHeader totalEvents={events.length} last24Hours={last24Hours} />
      
      <div className="space-y-24 py-8 px-8 max-w-7xl mx-auto mt-12">
        {/* Live Events Section */}
        <EventSection 
          title="Live Events" 
          events={liveEvents} 
          viewAllLink="/events/live-events"
        />

        {/* Premium Events Section */}
        {/* <EventSection 
          title="Premium Events" 
          events={premiumEvents} 
          viewAllLink="/events/premium-events"
        /> */}

        {/* Free Events Section */}
        {/* <EventSection 
          title="Free Events" 
          events={freeEvents} 
          viewAllLink="/events/free-events"
        /> */}
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
        {events.length > 4 && (
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

function EventCard({ event }: { event: Event }) {
  const router = useRouter();
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  
  const handleClick = () => {
    router.push(`/mint-presence/#id=${addressFromContractId(event.contractId)}`);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/mint-presence/#id=${addressFromContractId(event.contractId)}`;
    await navigator.clipboard.writeText(url);
    setIsSnackbarOpen(true);
  };

  return (
    <div className="border-2 border-black rounded-xl overflow-hidden bg-white shadow">
      <div className="relative aspect-square overflow-hidden border-b-2 border-black">
        {event.image ? (
          <img
            src={event.image}
            alt={event.eventName}
            className="w-full h-full object-cover"
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