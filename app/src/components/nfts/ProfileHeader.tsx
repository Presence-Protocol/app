'use client';

import { truncateAddress } from '@/utils/stringUtils';
// import { useDisconnect } from 'wagmi';

interface ProfileHeaderProps {
  address?: string;
  totalEvents: number;
  last24Hours: number;
  totalNFTs?: number;
}

export default function ProfileHeader({ 
  address = '',
  totalEvents, 
  last24Hours, 
  totalNFTs = 0 
}: ProfileHeaderProps) {
//   const { disconnect } = useDisconnect();

  return (
    <section className="overflow-hidden relative">
      <div className="mx-auto bg-lila-200 relative overflow-hidden border-black border-b-2">
        <div className="items-center w-full grid mx-auto p-8 lg:p-12">
          <img
            className="absolute shadow-large rounded-full shadow-black w-32 h-32 md:w-48 md:h-48 -top-10 -right-6 md:-top-16 md:-right-10"
            src="/images/blob3.svg"
            alt="your alt-text"
          />

          <img
            className="absolute shadow-large rounded-full shadow-black w-32 h-32 md:w-48 md:h-48 -bottom-6 left-10 md:-bottom-14 md:left-16"
            src="/images/blob4.svg"
            alt="your alt-text"
          />
          <img
            className="absolute w-48 h-48 md:w-64 md:h-64 shadow-large rounded-full shadow-black -bottom-16 -right-10 md:-bottom-24 md:-right-16"
            src="/images/blob1.svg"
            alt="your alt-text"
          />
          <img
            className="absolute shadow-large rounded-full shadow-black w-32 h-32 md:w-48 md:h-48 bottom-10 -left-10 md:bottom-14 md:-left-16"
            src="/images/blob2.svg"
            alt="your alt-text"
          />
          <img
            className="absolute shadow-large rounded-full shadow-black w-32 h-32 md:w-48 md:h-48 -top-20 left-28 md:-top-28 md:left-40"
            src="/images/blob5.svg"
            alt="your alt-text"
          />
          <div className="max-w-3xl mx-auto text-center lg:py-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h2 className="text-2xl lg:text-3xl font-semibold text-black text-center">
                Profile Dashboard
              </h2>
              <span className="bg-white px-4 py-1 rounded-full border-2 border-black text-sm">
                {truncateAddress(address)}
              </span>
            </div>
            
            <div className="flex justify-center gap-4 mb-8">
              <button 
                // onClick={() => disconnect()}
                className="bg-red-100 hover:bg-red-200 transition-colors border-2 border-black shadow shadow-black rounded-xl px-4 py-2 text-sm font-medium"
              >
                Disconnect Wallet
              </button>
              
              <a 
                href="/resources" 
                className="bg-white hover:bg-gray-100 transition-colors border-2 border-black shadow shadow-black rounded-xl px-4 py-2 text-sm font-medium"
              >
                Resources
              </a>
            </div>
            
            <div className="mt-8 flex justify-center gap-6">
              <div className="bg-white border-2 border-black shadow shadow-black rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-black">{totalNFTs}</div>
                <div className="text-sm text-gray-600 mt-1">Total NFTs</div>
              </div>
              
              <div className="bg-white border-2 border-black shadow shadow-black rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-black">{totalEvents}</div>
                <div className="text-sm text-gray-600 mt-1">Your Events</div>
              </div>
              
              <div className="bg-white border-2 border-black shadow shadow-black rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-black">{last24Hours}</div>
                <div className="text-sm text-gray-600 mt-1">Last 24h</div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <a 
                href="#nfts" 
                className="bg-white hover:bg-gray-100 transition-colors border-2 border-black shadow shadow-black rounded-xl px-6 py-3 text-sm font-medium"
              >
                View NFTs
              </a>
              
              <a 
                href="#events" 
                className="bg-white hover:bg-gray-100 transition-colors border-2 border-black shadow shadow-black rounded-xl px-6 py-3 text-sm font-medium"
              >
                View Events
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}