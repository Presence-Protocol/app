'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ExplorerHeader from './EventsHeader';
import { useRouter } from 'next/navigation';
import { addressFromContractId } from '@alephium/web3';
import EventSlider from '../nfts/EventSlider';

interface Event {
  contractId: string;
  eventName: string;
  caller: string;
  createdAt: string;
  updatedAt: string;
  // Add any additional fields needed for event type classification
  eventType?: 'free' | 'premium' | 'live';
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
        setEvents(filteredEvents);
        console.log('filteredEvents', filteredEvents);
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
        <EventSection 
          title="Premium Events" 
          events={premiumEvents} 
          viewAllLink="/events/premium-events"
        />

        {/* Free Events Section */}
        <EventSection 
          title="Free Events" 
          events={freeEvents} 
          viewAllLink="/events/free-events"
        />
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
  
  const getRelativeTime = (date: Date) => {
    try {
      return date.toRelativeTimeString();
    } catch (e) {
      return date.toLocaleDateString();
    }
  };


  const handleClick = () => {
    router.push(`/mint-presence/#id=${addressFromContractId(event.contractId)}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white p-4 rounded-xl border-2 border-black shadow-large cursor-pointer transition-transform block"
    >
      <div className="aspect-video rounded-lg bg-lila-500 mb-4 flex flex-col items-center justify-center p-2">
        <span className="text-sm font-medium text-black">
          {new Date(event.createdAt).toLocaleDateString()}
        </span>
        <span className="text-xs text-black mt-1">
          {new Date(event.createdAt).toLocaleTimeString()}
        </span>
      </div>
      <h3 className="font-medium text-lg truncate">{event.eventName}</h3>
      <div className="mt-2 space-y-1">
        <p className="text-sm text-gray-600 truncate">
          Created by: {event.caller.slice(0, 6)}...{event.caller.slice(-4)}
        </p>
        <p className="text-sm text-gray-600 truncate">
          ID: {event.contractId.slice(0, 8)}...
        </p>
        <div className="mt-2 text-xs inline-flex items-center px-2 py-1 rounded-full bg-lila-100 text-black">
          {getRelativeTime(new Date(event.createdAt))}
        </div>
      </div>
    </div>
  );
}