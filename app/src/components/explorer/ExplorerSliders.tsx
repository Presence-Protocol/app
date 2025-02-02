'use client';

import { useEffect, useState } from 'react';

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
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="mt-12 text-center">
        <div className="text-black items-center mb-4 shadow shadow-black text-xs font-semibold inline-flex px-4 bg-lila-300 border-black border-2 py-2 rounded-lg tracking-wide">
          Loading events...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12 text-center">
        <div className="text-red-600 items-center mb-4 shadow shadow-black text-xs font-semibold inline-flex px-4 bg-red-100 border-black border-2 py-2 rounded-lg tracking-wide">
          {error}
        </div>
      </div>
    );
  }

  // If no events, show placeholder
  if (events.length === 0) {
    return (
      <div className="mt-12 text-center">
        <div className="text-black items-center mb-4 shadow shadow-black text-xs font-semibold inline-flex px-4 bg-lila-300 border-black border-2 py-2 rounded-lg tracking-wide">
          No events found
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 relative">
      <div className="flex flex-col gap-4">
        <div className="flex justify-center">
          <div className="text-black items-center mb-4 shadow shadow-black text-xs font-semibold inline-flex px-4 bg-lila-300 border-black border-2 py-2 rounded-lg tracking-wide">
            <span>Latest Events</span>
          </div>
        </div>
        
        <div className="flex overflow-hidden pb-12">
          <div className="flex animate-scroll gap-6">
            {events.map((event, index) => (
              <div 
                key={event.contractId}
                className="flex-none w-64 bg-white p-4 rounded-xl border-2 border-black shadow-large"
              >
                <div className="aspect-square rounded-lg bg-lila-300 mb-4 flex items-center justify-center">
                  <span className="text-sm font-medium text-black">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-medium text-lg truncate">{event.eventName}</h3>
                <p className="text-sm text-gray-600 truncate">ID: {event.contractId.slice(0, 8)}...</p>
              </div>
            ))}
            {/* Duplicate items for seamless scrolling */}
            {events.map((event, index) => (
              <div 
                key={`duplicate-${event.contractId}`}
                className="flex-none w-64 bg-white p-4 rounded-xl border-2 border-black shadow-large"
              >
                <div className="aspect-square rounded-lg bg-lila-300 mb-4 flex items-center justify-center">
                  <span className="text-sm font-medium text-black">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-medium text-lg truncate">{event.eventName}</h3>
                <p className="text-sm text-gray-600 truncate">ID: {event.contractId.slice(0, 8)}...</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}