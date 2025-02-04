'use client';

import { useEffect, useState } from 'react';
import '../../utils/dateUtils';
import ExplorerHeader from './ExplorerHeader';

interface Event {
  contractId: string;
  eventName: string;
  caller: string;
  createdAt: string;
  updatedAt: string;
}

export default function ExplorerSliders() {
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
        // Filter out events with test/placeholder names
        const filteredEvents = data.filter((event: Event) => 
          !['test', 'asdsad', 'ffd', 'asdas', 'sdd'].includes(event.eventName.toLowerCase())
        );
        setEvents(filteredEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
    
    // Add auto-refresh every 5 minutes
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

  if (events.length === 0) {
    return (
      <div className="mt-12 text-center">
        <div className="text-black items-center mb-4 shadow shadow-black text-xs font-semibold inline-flex px-4 bg-lila-300 border-black border-2 py-2 rounded-lg tracking-wide">
          No events found
        </div>
      </div>
    );
  }

  const rows = [
    events.slice(0, Math.ceil(events.length / 3)),
    events.slice(Math.ceil(events.length / 3), Math.ceil(2 * events.length / 3)),
    events.slice(Math.ceil(2 * events.length / 3))
  ];

  return (
    <div>
      <ExplorerHeader 
        totalEvents={events.length} 
        last24Hours={last24Hours}
      />
      
      <div className="mx-auto py-8">
        <div className="space-y-12">
          {rows.map((rowEvents, rowIndex) => (
            <div key={`row-${rowIndex}`} className="relative">
              {/* Add fade overlays */}
              <div className="absolute left-0 top-0 w-64 h-full bg-gradient-to-r from-white to-transparent z-40"></div>
              <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-white to-transparent z-40"></div>
              
              {/* Add container with overflow hidden */}
              <div className="">
                <div className="flex">
                  <div className={`flex animate-scroll-${rowIndex} gap-12`}>
                    {/* Original events */}
                    {rowEvents.map((event) => (
                      <EventCard key={event.contractId} event={event} />
                    ))}
                    {/* Duplicated events for infinite scroll */}
                    {rowEvents.map((event) => (
                      <EventCard 
                        key={`duplicate-${event.contractId}`} 
                        event={event} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-0 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-1 {
          0% { transform: translateX(-25%); }
          100% { transform: translateX(-75%); }
        }
        @keyframes scroll-2 {
          0% { transform: translateX(-10%); }
          100% { transform: translateX(-60%); }
        }
        .animate-scroll-0 {
          animation: scroll-0 60s linear infinite;
        }
        .animate-scroll-1 {
          animation: scroll-1 75s linear infinite;
        }
        .animate-scroll-2 {
          animation: scroll-2 65s linear infinite;
        }
        .animate-scroll-0:hover,
        .animate-scroll-1:hover,
        .animate-scroll-2:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

// Separate EventCard component for better organization
function EventCard({ event }: { event: Event }) {
  console.log(event);
  const getRelativeTime = (date: Date) => {
    try {
      return date.toRelativeTimeString();
    } catch (e) {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex-none w-72 bg-white p-4 rounded-xl border-2 border-black shadow-large">
      <div className="aspect-video rounded-lg bg-lila-300 mb-4 flex flex-col items-center justify-center p-2">
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