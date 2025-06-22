import React from 'react';

// NOTE: Moved from NFTList.tsx
export interface NFTMetadata {
  title: string;
  description: string;
  image: string;
  tokenId: string;
  eventDateStart: string;
  eventDateEnd: string;
  collectionId: string;
}

// NOTE: Moved from NFTList.tsx
export interface Collection {
  id: string;
  name: string;
  description: string;
  nfts: NFTMetadata[];
}

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection | null;
  isAnimatingOut: boolean;
  handleShare: (collectionId: string) => void;
}

export default function CollectionModal({ isOpen, onClose, collection, isAnimatingOut, handleShare }: CollectionModalProps) {
  if (!isOpen || !collection) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{backgroundColor: 'rgba(0,0,0,0.7)'}}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-black shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all duration-300 border-black border-2 ${isAnimatingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-black bg-white/50 rounded-full p-1 z-10 hover:bg-gray-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-8 pb-4">
          <h2 className="text-2xl font-bold text-black mb-1 flex items-center">
            {collection.name}
          </h2>
          <p className="text-gray-600 mt-2 text-sm">{collection.description}</p>
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex overflow-x-auto space-x-4 p-8 pt-4" style={{ scrollbarWidth: 'none' }}>
            {collection.nfts.map((nft) => (
              <div key={nft.tokenId} className="flex-shrink-0 w-64">
                <div className="border-2 border-black rounded-xl overflow-hidden bg-white shadow h-full flex flex-col">
                  <div className="relative aspect-square overflow-hidden border-b-2 border-black">
                    {nft.image ? (
                      <img src={nft.image} alt={nft.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-lila-100 to-lila-300">
                        <h4 className="text-xl font-semibold text-black text-center mb-2">{nft.title}</h4>
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
        </div>
      </div>
    </div>
  );
} 