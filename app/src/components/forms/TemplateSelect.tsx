import React, { useState, useEffect, useRef } from 'react';

interface TemplateSelectProps {
  selectedTemplate: 'custom' | null;
  onSelect: (template: 'custom') => void;
}

const TemplateSelect: React.FC<TemplateSelectProps> = ({ selectedTemplate, onSelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleSelect = (template: 'custom') => {
    onSelect(template);
    setIsMenuOpen(false);
  };

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* <h3 className="text-xl font-medium text-black">Templates</h3> */}
      <div className="inline-flex flex-wrap items-center w-full gap-2 my-auto">
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-black items-center min-w-[180px] shadow shadow-black text-md font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 border-2 duration-100 sm:w-auto py-3 rounded-lg h-16 tracking-wide w-full hover:text-lila-800 gap-3"
          >
            <span>{selectedTemplate ? 'Custom' : 'Select Template'}</span>
            <svg
              className={`inline h-4 transition-transform duration-200 transform ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M6 9l6 6l6 -6"></path>
            </svg>
          </button>
          {isMenuOpen && (
            <div
              className="shadow absolute right-0 z-10 mt-6 w-[calc(100vw-2rem)] max-w-lg min-w-lg rounded-lg bg-white ring-2 ring-black focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
              tabIndex={-1}
            >
              <div className="w-full bg-white rounded-lg flex-auto overflow-hidden text-sm">
                <div className="divide-y-2 divide-black">
                  <div
                    className="group relative flex gap-x-6 p-4 duration-300 bg-white"
                    onClick={() => handleSelect('custom')}
                  >
                    <div className="flex h-10 w-10 flex-none items-center justify-center bg-white text-black group-hover:text-lila-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
                      </svg>
                    </div>
                    <div>
                      <a href="#_" className="font-semibold text-black group-hover:text-gray-700 duration-300">
                        Custom
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-black group-hover:text-gray-500">
                        Access all event options
                      </p>
                    </div>
                  </div>

                  <div
                    className="group relative flex gap-x-6 p-4 duration-300 bg-white"
                    onClick={() => handleSelect('custom')}
                  >
                    <div className="flex h-10 w-10 flex-none items-center justify-center bg-white text-black group-hover:text-lila-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                      </svg>
                    </div>
                    <div>
                      <a href="#_" className="font-semibold text-black group-hover:text-gray-700 duration-300">
                        Birthday
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-black group-hover:text-gray-500">
                        Create a birthday event
                      </p>
                    </div>
                  </div>

                  <div
                    className="group relative flex gap-x-6 p-4 duration-300 bg-white"
                    onClick={() => handleSelect('custom')}
                  >
                    <div className="flex h-10 w-10 flex-none items-center justify-center bg-white text-black group-hover:text-lila-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                      </svg>
                    </div>
                    <div>
                      <a href="#_" className="font-semibold text-black group-hover:text-gray-700 duration-300">
                        Meetup
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-black group-hover:text-gray-500">
                        Create a meetup event
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelect; 