import React, { useState, useEffect, useRef } from 'react';

interface TemplateSelectProps {
  selectedTemplate: 'custom' | 'free' | 'paid' | 'creator' | 'birthday' | 'fundraiser' | 'meetup';
  onSelect: (template: 'custom' | 'free' | 'paid' | 'creator' | 'birthday' | 'fundraiser' | 'meetup') => void;
}

const TemplateSelect: React.FC<TemplateSelectProps> = ({ selectedTemplate, onSelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleSelect = (template: 'custom' | 'free' | 'paid' | 'creator' | 'birthday' | 'fundraiser' | 'meetup') => {
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
            <span style={{ textTransform: 'capitalize' }}>{selectedTemplate ? selectedTemplate + ' Event' : 'Select Template'}</span>
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
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
                      </svg>
                    </div>
                    <div>
                      <a href="#_" className="font-semibold text-black group-hover:text-gray-700 duration-300">
                        All Event Options
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-black group-hover:text-gray-500">
                        Access all event options
                      </p>
                    </div>
                  </div>


                  {/* add to templates: Proof of Attendance */}
                  {/* Add date below description */}
                  {/* when no imahe on presence page, show image from template */}
                  {/* add images to events and make like presence */}


                  <div
                    className="group relative flex gap-x-6 p-4 duration-300 bg-white"
                    onClick={() => handleSelect('free')}
                  >
                    <div className="flex h-10 w-10 flex-none items-center justify-center bg-white text-black group-hover:text-lila-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                      </svg>


                    </div>
                    <div>
                      <a href="#_" className="font-semibold text-black group-hover:text-gray-700 duration-300">
                        Free Event
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-black group-hover:text-gray-500">
                        Create a free event
                      </p>
                    </div>
                  </div>

                  <div
                    className="group relative flex gap-x-6 p-4 duration-300 bg-white"
                    onClick={() => handleSelect('paid')}
                  >
                    <div className="flex h-10 w-10 flex-none items-center justify-center bg-white text-black group-hover:text-lila-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>

                    </div>
                    <div>
                      <a href="#_" className="font-semibold text-black group-hover:text-gray-700 duration-300">
                        Paid Event
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-black group-hover:text-gray-500">
                        Create a paid event
                      </p>
                    </div>
                  </div>

                  <div
                    className="group relative flex gap-x-6 p-4 duration-300 bg-white"
                    onClick={() => handleSelect('creator')}
                  >
                    <div className="flex h-10 w-10 flex-none items-center justify-center bg-white text-black group-hover:text-lila-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                      </svg>
                    </div>
                    <div>
                      <a href="#_" className="font-semibold text-black group-hover:text-gray-700 duration-300">
                        Creator Event
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-black group-hover:text-gray-500">
                        Create a subscription event
                      </p>
                    </div>
                  </div>


                  {/* <div
                    className="group relative flex gap-x-6 p-4 duration-300 bg-white"
                    onClick={() => handleSelect('custom')}
                  >
                    <div className="flex h-10 w-10 flex-none items-center justify-center bg-white text-black group-hover:text-lila-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                      </svg>

                    </div>
                    <div>
                      <a href="#_" className="font-semibold text-black group-hover:text-gray-700 duration-300">
                        Proof of Attendance
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-black group-hover:text-gray-500">
                        Create a birthday event
                      </p>
                    </div>
                  </div> */}

                  <div
                    className="group relative flex gap-x-6 p-4 duration-300 bg-white"
                    onClick={() => handleSelect('birthday')}
                  >
                    <div className="flex h-10 w-10 flex-none items-center justify-center bg-white text-black group-hover:text-lila-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                      </svg>
                    </div>
                    <div>
                      <a href="#_" className="font-semibold text-black group-hover:text-gray-700 duration-300">
                        Birthday Event
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-black group-hover:text-gray-500">
                        Create a birthday event
                      </p>
                    </div>
                  </div>


                  {/* <div
                    className="group relative flex gap-x-6 p-4 duration-300 bg-white"
                    onClick={() => handleSelect('custom')}
                  >
                    <div className="flex h-10 w-10 flex-none items-center justify-center bg-white text-black group-hover:text-lila-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                      </svg>

                    </div>
                    <div>
                      <a href="#_" className="font-semibold text-black group-hover:text-gray-700 duration-300">
                        Proof of Attendance
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-black group-hover:text-gray-500">
                        Create a birthday event
                      </p>
                    </div>
                  </div> */}

                  <div
                    className="group relative flex gap-x-6 p-4 duration-300 bg-white"
                    onClick={() => handleSelect('fundraiser')}
                  >
                    <div className="flex h-10 w-10 flex-none items-center justify-center bg-white text-black group-hover:text-lila-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                      </svg>

                    </div>
                    <div>
                      <a href="#_" className="font-semibold text-black group-hover:text-gray-700 duration-300">
                        Fundraiser Event
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-black group-hover:text-gray-500">
                        Raise funds for a cause
                      </p>
                    </div>
                  </div>

                  <div
                    className="group relative flex gap-x-6 p-4 duration-300 bg-white"
                    onClick={() => handleSelect('meetup')}
                  >
                    <div className="flex h-10 w-10 flex-none items-center justify-center bg-white text-black group-hover:text-lila-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                      </svg>
                    </div>
                    <div>
                      <a href="#_" className="font-semibold text-black group-hover:text-gray-700 duration-300">
                        Meetup Event
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