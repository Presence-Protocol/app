import React from 'react';

interface MintAmountInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MintAmountInfo({ isOpen, onClose }: MintAmountInfoProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md border-black border-2 shadow-black">
        <h2 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon size-6 icon-tabler icon-tabler-info-circle mr-2"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M12 8l.01 0" />
            <path d="M11 12l1 0l0 4l1 0" />
          </svg>
          Mint Amount Information
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          The mint amount determines the total number of times this Presence NFT can be minted. This is the maximum supply of your event's NFTs.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          For example, if you set the mint amount to 100, only 100 people will be able to mint this NFT for your event.
        </p>
        <button
          onClick={onClose}
          className="text-black items-center shadow shadow-black text-sm font-semibold inline-flex px-4 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-2 rounded-lg tracking-wide focus:translate-y-1 w-full hover:text-lila-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}
