'use client';

import { useState } from 'react';
import Link from 'next/link';

export type ProgressStep = 'preparing' | 'submitted' | 'completed';
export type ProgressState = {
  currentStep: ProgressStep;
  txHash?: string;
  contractAddress?: string;
};

interface PoapProgressProps {
  isOpen: boolean;
  onClose: () => void;
  progress: ProgressState;
}

export default function PoapProgress({ isOpen, onClose, progress }: PoapProgressProps) {
  if (!isOpen) return null;

  const steps: { key: ProgressStep; label: string }[] = [
    { key: 'preparing', label: 'Preparing transaction' },
    { key: 'submitted', label: 'Transaction submitted' },
    { key: 'completed', label: 'Contract deployment complete' },
  ];

  const getStepStatus = (step: ProgressStep) => {
    const stepOrder = steps.findIndex(s => s.key === step);
    const currentOrder = steps.findIndex(s => s.key === progress.currentStep);

    if (step === 'completed' && progress.currentStep === 'completed') return 'completed'; // Auto-complete the last step

    if (stepOrder < currentOrder) return 'completed';
    if (stepOrder === currentOrder) return 'current';

    return 'pending';
  };

  return (
    <div className="w-full flex flex-col items-center">
    <div className="w-full overflow-y-auto ring-2 ring-inset ring-black text-black bg-white shadow shadow-foreground rounded-xl p-8 mb-6">
      <h2 className="text-lg font-semibold text-black lg:text-2xl md:text-xl mb-2">
        {progress.currentStep === 'completed' ? 'Presence Event Created' : 'Creating your Presence Event'}
      </h2>
      <p className="text-sm text-gray-500 mb-6">{progress.currentStep === 'completed' ? 'Your Presence Event has been created. You can leave this page now.' : 'This won\'t take long, your presence is being deployed to the blockchain.'}</p>

      <div className="space-y-4">
        {steps.map(({ key, label }) => {
          const status = getStepStatus(key);
          return (
            <div key={key} className="flex items-center space-x-3">
              {status === 'pending' ? (
                <div className="w-5 h-5" /> // Empty space for alignment
              ) : status === 'current' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
              ) : (
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
              <span className="text-sm">{label}</span>
              
              {key === 'submitted' && progress.txHash && status !== 'pending' && (
                <Link 
                  href={`https://explorer.alephium.org/transactions/${progress.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black items-center shadow shadow-black text-xs font-semibold inline-flex px-4 bg-lila-300 border-black border-2 py-2 rounded-lg tracking-wide ml-auto"
                >
                  View transaction
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {progress.currentStep === 'completed' && (
        <div className="mt-8 space-y-4">
          <Link 
            href={`https://explorer.alephium.org/addresses/${progress.contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black items-center shadow-small shadow-black  text-sm font-semibold inline-flex px-4 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-2 rounded-lg tracking-wide focus:translate-y-1 w-full hover:text-lila-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            View on Explorer
          </Link>
          
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/mint-presence/#id=${progress.contractAddress}`)}
            className="text-black items-center shadow-small shadow-black text-sm font-semibold inline-flex px-4 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-2 rounded-lg tracking-wide focus:translate-y-1 w-full hover:text-lila-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
              <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
            </svg>
            Copy Mint Link
          </button>

          <button
            onClick={() => window.open(`${window.location.origin}/mint-presence/#id=${progress.contractAddress}`, '_blank')}
            className="text-black items-center shadow-small shadow-black text-sm font-semibold inline-flex px-4 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-2 rounded-lg tracking-wide focus:translate-y-1 w-full hover:text-lila-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Preview Event
          </button>
          
         
        </div>

      )}

      
  
    </div>
   {/*progress.txHash && (
      <Link 
        href="/new-event"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-lila-800 hover:underline text-center"
      >
        You can leave this page now. Why not create another event?
      </Link>
    )*/}
    </div>
  );
}
