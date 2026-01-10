import React, { useState } from 'react';

// NOTE: Moved from NFTList.tsx
export interface NFTMetadata {
  title: string;
  description: string;
  image: string;
  tokenId: string;
  eventDateStart: string;
  eventDateEnd: string;
  collectionId: string;
  eventId?: number;
  totalPresences?: number;
  uniqueAttendees?: number;
}

// Presence data for a specific event
export interface PresenceData {
  contractId: string;
  collectionContractId: string;
  eventId: number;
  nftIndex: number;
  caller: string;
  isPublic: boolean;
  hasParticipated: boolean;
  createdAt: string;
}

// NOTE: Moved from NFTList.tsx
export interface Collection {
  id: string;
  name: string;
  description: string;
  nfts: NFTMetadata[];
  isSeries?: boolean;
}

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection | null;
  isAnimatingOut: boolean;
  handleShare: (collectionId: string, eventId?: number) => void;
}

// Truncate address helper
const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function CollectionModal({ isOpen, onClose, collection, isAnimatingOut, handleShare }: CollectionModalProps) {
  const [selectedEvent, setSelectedEvent] = useState<NFTMetadata | null>(null);
  const [presences, setPresences] = useState<PresenceData[]>([]);
  const [loadingPresences, setLoadingPresences] = useState(false);
  const [presenceError, setPresenceError] = useState<string | null>(null);

  const handleEventClick = async (nft: NFTMetadata) => {
    if (!collection?.isSeries || nft.eventId === undefined) return;

    setSelectedEvent(nft);
    setLoadingPresences(true);
    setPresenceError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'https://presenceprotocol.notrustverify.ch'}/api/poap-serie/${collection.id}/event/${nft.eventId}?limit=100`
      );

      if (response.ok) {
        const data = await response.json();
        setPresences(data.presences || data || []);
      } else {
        setPresenceError('Failed to load presences');
      }
    } catch (error) {
      console.error('Error fetching presences:', error);
      setPresenceError('Failed to load presences');
    } finally {
      setLoadingPresences(false);
    }
  };

  const handleBackToEvents = () => {
    setSelectedEvent(null);
    setPresences([]);
    setPresenceError(null);
  };

  const handleClose = () => {
    setSelectedEvent(null);
    setPresences([]);
    setPresenceError(null);
    onClose();
  };

  if (!isOpen || !collection) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{backgroundColor: 'rgba(0,0,0,0.7)'}}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-xl shadow-black shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all duration-300 border-black border-2 ${isAnimatingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-black bg-white/50 rounded-full p-1 z-10 hover:bg-gray-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-8 pb-4">
          {selectedEvent ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToEvents}
                className="text-black hover:bg-gray-100 rounded-full p-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-black mb-1">{selectedEvent.title}</h2>
                <p className="text-gray-600 text-sm">
                  {presences.length} presence{presences.length !== 1 ? 's' : ''} minted
                </p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-black mb-1 flex items-center">
                {collection.name}
                {collection.isSeries && (
                  <span className="ml-2 text-xs font-medium bg-lila-200 text-lila-800 px-2 py-1 rounded-full">
                    Series
                  </span>
                )}
              </h2>
              <p className="text-gray-600 mt-2 text-sm">{collection.description}</p>
              {collection.isSeries && (
                <p className="text-gray-500 mt-1 text-xs">Click on an event to view its presences</p>
              )}
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedEvent ? (
            // Presences View
            <div className="p-8 pt-4 overflow-y-auto">
              {loadingPresences ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : presenceError ? (
                <div className="text-center py-12 text-gray-500">{presenceError}</div>
              ) : presences.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No presences minted yet</div>
              ) : (
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
                          className="text-gray-400 hover:text-black transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Events View
            <div className="flex overflow-x-auto space-x-4 p-8 pt-4" style={{ scrollbarWidth: 'none' }}>
              {collection.nfts.map((nft) => (
                <div
                  key={nft.tokenId}
                  className={`flex-shrink-0 w-64 ${collection.isSeries ? 'cursor-pointer' : ''}`}
                  onClick={() => collection.isSeries && handleEventClick(nft)}
                >
                  <div className={`border-2 border-black rounded-xl overflow-hidden bg-white shadow h-full flex flex-col ${collection.isSeries ? 'hover:shadow-lg hover:border-lila-600 transition-all' : ''}`}>
                    <div className="relative aspect-square overflow-hidden border-b-2 border-black">
                      {nft.image ? (
                        <img src={nft.image} alt={nft.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-lila-100 to-lila-300">
                          <h4 className="text-xl font-semibold text-black text-center mb-2">{nft.title}</h4>
                        </div>
                      )}
                      {collection.isSeries && nft.totalPresences !== undefined && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full">
                          {nft.totalPresences} minted
                        </div>
                      )}
                    </div>
                    <div className="p-4 pb-5 bg-white flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-black mb-1">{nft.title}</h3>
                        <p className="text-xs text-black mb-3 line-clamp-2">{nft.description}</p>
                      </div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 