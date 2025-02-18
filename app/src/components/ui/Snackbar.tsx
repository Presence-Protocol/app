import React, { useEffect, useState } from 'react';

interface SnackbarProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Snackbar({ message, isOpen, onClose, duration = 3000 }: SnackbarProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setTimeout(onClose, 300); // Wait for fade out animation before calling onClose
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen && !shouldRender) return null;

  return (
    <div className="fixed bottom-[50px] left-1/2 -translate-x-1/2 z-50">
      <div 
        className={`bg-white px-6 py-3 rounded-xl border-2 border-black shadow-lg flex items-center gap-2 min-w-[200px] max-w-[400px] justify-center transition-all duration-300 ease-in-out ${
          shouldRender 
            ? 'translate-y-0 opacity-100 slide-in' 
            : 'translate-y-full opacity-0 slide-out'
        }`}
        style={{
          animation: shouldRender 
            ? 'slideIn 0.3s ease-out forwards'
            : 'slideOut 0.3s ease-in forwards'
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={1.5} 
          stroke="currentColor" 
          className="w-5 h-5 text-lila-600"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        <span className="text-sm font-medium text-black">{message}</span>
      </div>
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}