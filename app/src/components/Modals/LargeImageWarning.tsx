import React from 'react';

interface LargeImageWarningProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LargeImageWarning({ isOpen, onClose }: LargeImageWarningProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backgroundColor: 'rgba(0,0,0,0.7)'}}>
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md border-black border-2 shadow-black">
        
        <h2 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon size-6 icon-tabler icon-tabler-alert-triangle text-danger-600 mr-2"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinecap="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"
                            ></path>
                            <path d="M12 9v4"></path>
                            <path
                              d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"
                            ></path>
                            <path d="M12 16h.01"></path>
                          </svg>Image Size Error</h2>
        <p className="text-sm text-gray-500 mb-6">
          The selected image exceeds the maximum allowed size of 3072 bytes. Please choose a smaller image.
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
