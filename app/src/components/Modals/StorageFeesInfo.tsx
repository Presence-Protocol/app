import React from 'react';

interface StorageFeesInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StorageFeesInfo({ isOpen, onClose }: StorageFeesInfoProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md border-black border-2 shadow-black">
        <h2 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 mr-2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
          </svg>
          Storage Fees
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Storage fees are used to compensate for the blockchain storage space used by your event. 
          These fees are allocated to maintain the data associated with your Presence NFTs.
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