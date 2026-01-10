'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { contractIdFromAddress, web3 } from '@alephium/web3';

interface SeriesData {
  contractId: string;
  eventName: string;
  description?: string;
  image?: string;
  caller: string;
  isPublic: boolean;
  createdAt: string;
  eventsCount?: number;
}

interface EventData {
  contractId: string;
  collectionContractId: string;
  eventId: number;
  eventName: string;
  description?: string;
  image?: string;
  organizer: string;
  isPublic: boolean;
  createdAt: string;
  eventDateStart?: string;
  eventDateEnd?: string;
  maxSupply?: number;
  mintStartAt?: string;
  mintEndAt?: string;
}

interface EventStats {
  eventId: number;
  totalPresences: number;
  uniqueAttendees: number;
}

interface PresenceData {
  contractId: string;
  collectionContractId: string;
  eventId: number;
  nftIndex: number;
  caller: string;
  isPublic: boolean;
  hasParticipated: boolean;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://presenceprotocol.notrustverify.ch';

const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function SeriesDetail() {
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [series, setSeries] = useState<SeriesData | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [eventStats, setEventStats] = useState<Record<number, EventStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Presence viewing state
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [presences, setPresences] = useState<PresenceData[]>([]);
  const [loadingPresences, setLoadingPresences] = useState(false);
  const [presencesPagination, setPresencesPagination] = useState({ total: 0, hasMore: false, offset: 0 });

  // Setup web3 node provider
  useEffect(() => {
    web3.setCurrentNodeProvider(
      process.env.NEXT_PUBLIC_NODE_URL ?? "https://node.testnet.alephium.org",
      undefined,
      undefined
    );
  }, []);

  // Parse series ID from URL hash and convert address to contractId
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const idMatch = hash.match(/id=([^&]*)/);
      const id = idMatch ? idMatch[1] : null;

      if (id) {
        try {
          // If it's an address format, convert to contractId
          // Address format starts with a number, contractId is hex
          if (/^[0-9]/.test(id)) {
            const contractIdBytes = contractIdFromAddress(id);
            // Convert Uint8Array to hex string
            const contractId = Array.from(contractIdBytes)
              .map(b => b.toString(16).padStart(2, '0'))
              .join('');
            setSeriesId(contractId);
          } else {
            // Already a contractId (hex format)
            setSeriesId(id);
          }
        } catch (err) {
          console.error('Error converting address to contractId:', err);
          setSeriesId(id); // Use as-is if conversion fails
        }
      }
    }
  }, []);

  // Fetch series data when ID is available
  useEffect(() => {
    if (!seriesId) return;

    const fetchSeriesData = async () => {
      setLoading(true);
      setError(null);

      try {
        // First fetch events - this endpoint seems more reliable
        let eventsData: EventData[] = [];

        try {
          const eventsResponse = await fetch(`${API_URL}/api/series/${seriesId}/events?limit=100`);
          if (eventsResponse.ok) {
            const rawEvents = await eventsResponse.json();
            // Add eventId if not present (use array index)
            eventsData = rawEvents.map((event: EventData, index: number) => ({
              ...event,
              eventId: event.eventId ?? index
            }));
            setEvents(eventsData);
          }
        } catch (eventsErr) {
          console.error('Error fetching events:', eventsErr);
        }

        // Try to fetch series details
        let seriesData: SeriesData | null = null;
        try {
          const seriesResponse = await fetch(`${API_URL}/api/series/${seriesId}`);
          if (seriesResponse.ok) {
            seriesData = await seriesResponse.json();
          }
        } catch (seriesErr) {
          console.warn('Could not fetch series details:', seriesErr);
        }

        // If series details failed but we have events, create a fallback series object
        if (!seriesData && eventsData.length > 0) {
          seriesData = {
            contractId: seriesId,
            eventName: 'Series Collection',
            caller: eventsData[0]?.organizer || '',
            isPublic: true,
            createdAt: eventsData[0]?.createdAt || new Date().toISOString(),
            eventsCount: eventsData.length
          };
        }

        if (seriesData) {
          setSeries(seriesData);
        } else {
          setError('Series not found or no events available');
        }

        // Fetch presence stats for each event
        try {
          const statsResponse = await fetch(`${API_URL}/api/poap-serie/${seriesId}/stats/events`);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            const statsMap: Record<number, EventStats> = {};
            if (statsData.events) {
              statsData.events.forEach((stat: EventStats) => {
                statsMap[stat.eventId] = stat;
              });
            }
            setEventStats(statsMap);
          }
        } catch (statsErr) {
          console.warn('Could not fetch stats:', statsErr);
        }
      } catch (err) {
        console.error('Error fetching series:', err);
        setError(err instanceof Error ? err.message : 'Failed to load series');
      } finally {
        setLoading(false);
      }
    };

    fetchSeriesData();
  }, [seriesId]);

  // Fetch presences for selected event
  const fetchPresences = async (event: EventData, offset: number = 0) => {
    if (!seriesId) return;

    setLoadingPresences(true);
    try {
      const response = await fetch(
        `${API_URL}/api/poap-serie/${seriesId}/event/${event.eventId}?limit=50&offset=${offset}`
      );
      if (response.ok) {
        const data = await response.json();
        const newPresences = data.presences || data || [];

        if (offset === 0) {
          setPresences(newPresences);
        } else {
          setPresences(prev => [...prev, ...newPresences]);
        }

        setPresencesPagination({
          total: data.pagination?.total || newPresences.length,
          hasMore: data.pagination?.hasMore || false,
          offset: offset + newPresences.length
        });
      }
    } catch (err) {
      console.error('Error fetching presences:', err);
    } finally {
      setLoadingPresences(false);
    }
  };

  const handleEventClick = (event: EventData) => {
    setSelectedEvent(event);
    setPresences([]);
    setPresencesPagination({ total: 0, hasMore: false, offset: 0 });
    fetchPresences(event, 0);
  };

  const handleBackToEvents = () => {
    setSelectedEvent(null);
    setPresences([]);
  };

  const handleLoadMore = () => {
    if (selectedEvent && presencesPagination.hasMore) {
      fetchPresences(selectedEvent, presencesPagination.offset);
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-12 md:py-24 bg-lila-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error || !series) {
    return (
      <section className="py-12 md:py-24 bg-lila-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center py-24">
            <h2 className="text-2xl font-bold text-black mb-4">
              {error || 'Series not found'}
            </h2>
            <p className="text-gray-600 mb-8">
              The series you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center px-6 py-3 border-2 border-black rounded-xl bg-white hover:bg-lila-100 transition-colors font-medium"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // No series ID in URL
  if (!seriesId) {
    return (
      <section className="py-12 md:py-24 bg-lila-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center py-24">
            <h2 className="text-2xl font-bold text-black mb-4">
              No Series Selected
            </h2>
            <p className="text-gray-600 mb-8">
              Please provide a series ID in the URL.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center px-6 py-3 border-2 border-black rounded-xl bg-white hover:bg-lila-100 transition-colors font-medium"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-24 bg-lila-200 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        {selectedEvent ? (
          <button
            onClick={handleBackToEvents}
            className="mb-6 inline-flex items-center gap-2 text-black hover:text-lila-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Events
          </button>
        ) : (
          <Link
            href="/events"
            className="mb-6 inline-flex items-center gap-2 text-black hover:text-lila-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Explorer
          </Link>
        )}

        {/* Series Header */}
        <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-lg mb-8">
          <div className="md:flex">
            {/* Series Image */}
            <div className="md:w-1/3 aspect-square md:aspect-auto border-b-2 md:border-b-0 md:border-r-2 border-black">
              {series.image ? (
                <img
                  src={series.image}
                  alt={series.eventName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-gradient-to-br from-lila-100 to-lila-300">
                  <span className="text-4xl font-bold text-lila-600">
                    {series.eventName?.charAt(0) || 'S'}
                  </span>
                </div>
              )}
            </div>

            {/* Series Info */}
            <div className="md:w-2/3 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-black">
                  {series.eventName}
                </h1>
                <span className="text-xs font-medium bg-lila-200 text-lila-800 px-3 py-1 rounded-full">
                  Series
                </span>
              </div>

              {series.description && (
                <p className="text-gray-600 mb-6">{series.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-lila-50 border-2 border-lila-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-black">{events.length}</p>
                  <p className="text-xs text-gray-600">Events</p>
                </div>
                <div className="bg-lila-50 border-2 border-lila-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-black">
                    {Object.values(eventStats).reduce((sum, s) => sum + s.totalPresences, 0)}
                  </p>
                  <p className="text-xs text-gray-600">Total Presences</p>
                </div>
                <div className="bg-lila-50 border-2 border-lila-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-black">
                    {Object.values(eventStats).reduce((sum, s) => sum + s.uniqueAttendees, 0)}
                  </p>
                  <p className="text-xs text-gray-600">Unique Attendees</p>
                </div>
                <div className="bg-lila-50 border-2 border-lila-200 rounded-xl p-4 text-center">
                  <p className="text-sm font-medium text-black truncate" title={series.caller}>
                    {truncateAddress(series.caller)}
                  </p>
                  <p className="text-xs text-gray-600">Organizer</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Event Presences View */}
        {selectedEvent ? (
          <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-lg">
            <div className="p-6 border-b-2 border-black bg-lila-50">
              <div className="flex items-center gap-4">
                {selectedEvent.image && (
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.eventName}
                    className="w-16 h-16 rounded-xl border-2 border-black object-cover"
                  />
                )}
                <div>
                  <h2 className="text-xl font-bold text-black">{selectedEvent.eventName}</h2>
                  <p className="text-sm text-gray-600">
                    {eventStats[selectedEvent.eventId]?.totalPresences || 0} presences minted
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loadingPresences && presences.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : presences.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No presences minted for this event yet
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {presences.map((presence, index) => (
                      <div
                        key={presence.contractId || index}
                        className="flex items-center justify-between p-4 border-2 border-black rounded-xl bg-white hover:bg-lila-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-lila-200 flex items-center justify-center border-2 border-black">
                            <span className="text-sm font-semibold">#{presence.nftIndex}</span>
                          </div>
                          <div>
                            <p className="font-medium text-black">{truncateAddress(presence.caller)}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(presence.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {presence.hasParticipated && (
                            <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Validated
                            </span>
                          )}
                          <a
                            href={`https://explorer.alephium.org/addresses/${presence.caller}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-black transition-colors p-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  {presencesPagination.hasMore && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingPresences}
                        className="px-6 py-3 border-2 border-black rounded-xl bg-white hover:bg-lila-100 transition-colors font-medium disabled:opacity-50"
                      >
                        {loadingPresences ? 'Loading...' : 'Load More'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* Events Grid */
          <>
            <h2 className="text-xl font-bold text-black mb-4">
              Events in this Series ({events.length})
            </h2>

            {events.length === 0 ? (
              <div className="bg-white border-2 border-black rounded-2xl p-12 text-center">
                <p className="text-gray-600">No events in this series yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => {
                  const stats = eventStats[event.eventId];
                  return (
                    <div
                      key={event.contractId}
                      onClick={() => handleEventClick(event)}
                      className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow hover:shadow-lg hover:border-lila-600 transition-all cursor-pointer"
                    >
                      {/* Event Image */}
                      <div className="relative aspect-square border-b-2 border-black">
                        {event.image ? (
                          <img
                            src={event.image}
                            alt={event.eventName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-lila-100 to-lila-300">
                            <span className="text-2xl font-bold text-lila-600">
                              #{event.eventId}
                            </span>
                          </div>
                        )}
                        {stats && (
                          <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-medium px-3 py-1 rounded-full">
                            {stats.totalPresences} minted
                          </div>
                        )}
                      </div>

                      {/* Event Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-black mb-1">
                          {event.eventName}
                        </h3>
                        {event.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center pt-3 border-t-2 border-black">
                          <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-2 bg-lila-300 border-lila-600 border-2 py-1 rounded-lg tracking-wide">
                            Event #{event.eventId}
                          </div>
                          {stats && (
                            <div className="text-xs text-gray-600">
                              {stats.uniqueAttendees} attendees
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
