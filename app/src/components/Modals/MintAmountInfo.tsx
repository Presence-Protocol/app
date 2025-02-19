import React from 'react';

interface MintAmountInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MintAmountInfo({ isOpen, onClose }: MintAmountInfoProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backgroundColor: 'rgba(0,0,0,0.7)'}}>
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md border-black border-2 shadow-black">
        <h2 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
          </svg>
          Presence Mint Amount Info
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          The presence mint amount determines the total number of times this Presence can be minted. This is the maximum supply of your event's presence (NFTs).
        </p>
        <p className="text-sm text-gray-500 mb-6">
          For example, if you set the mint amount to 100, only 100 people will be able to mint this presence for your event.
        </p>
        <button
          onClick={onClose}
          className="text-black items-center shadow shadow-black text-sm font-semibold inline-flex px-4 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-2 rounded-lg tracking-wide focus:translate-y-1 w-full hover:text-lila-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}
