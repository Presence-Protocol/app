import React from 'react';

interface PresencePriceInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PresencePriceInfo({ isOpen, onClose }: PresencePriceInfoProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md border-black border-2 shadow-black">
        <h2 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 mr-2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Presence Price
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Set a price that users need to pay to mint your Presence NFT. This can be used to 
          create value for your event or cover associated costs. The price is denominated in ALPH.
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