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
    
    if (stepOrder < currentOrder) return 'completed';
    if (stepOrder === currentOrder) return 'current';
    return 'pending';
  };

  return (
    <div className="w-full flex flex-col items-center">
    <div className="w-full overflow-y-auto ring-2 ring-inset ring-black text-black bg-white shadow-small rounded-xl p-8 mb-6">
      <h2 className="text-lg font-semibold text-black lg:text-2xl md:text-xl mb-2">
        Creating your Presence Event
      </h2>
      <p className="text-sm text-gray-500 mb-6">This won't take long, your presence is being deployed to the blockchain.</p>

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
            className="text-black items-center shadow shadow-black text-sm font-semibold inline-flex px-4 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-2 rounded-lg tracking-wide focus:translate-y-1 w-full hover:text-lila-800"
          >
            View on Explorer
          </Link>
          
          <Link 
            href={`/mint-presence/#id=${progress.contractAddress}`}
            className="text-black items-center shadow shadow-black text-sm font-semibold inline-flex px-4 focus:outline-none justify-center text-center bg-lila-400 border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-2 rounded-lg tracking-wide focus:translate-y-1 w-full hover:text-lila-800"
          >
            Share Mint Link
          </Link>
          
         
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
