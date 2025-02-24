import React, { useState } from 'react';

interface TemplateSelectProps {
  selectedTemplate: 'custom' | 'template1' | 'template2';
  onSelect: (template: 'custom' | 'template1' | 'template2') => void;
}

const TemplateSelect: React.FC<TemplateSelectProps> = ({ selectedTemplate, onSelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSelect = (template: 'custom' | 'template1' | 'template2') => {
    onSelect(template);
    setIsMenuOpen(false);
  };

  return (
    <div className="">
      {/* <h3 className="text-xl font-medium text-black">Templates</h3> */}
      <div className="inline-flex flex-wrap items-center w-full gap-2 my-auto">
        <div className="relative mx-auto">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white sm:w-auto py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:text-lila-800 gap-3"
          >
            <span>{selectedTemplate === 'custom' ? 'Custom' : 'Template'}</span>
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
              className="shadow absolute right-0 z-10 mt-2 origin-top-right left-1/2 flex w-screen max-w-sm -translate-x-1/2 rounded-lg bg-white ring-2 ring-black focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
              tabIndex={-1}
            >
              <div className="w-screen max-w-3xl bg-white rounded-lg flex-auto overflow-hidden text-sm">
                <div className="divide-y-2 divide-black">
                  <div
                    className="group relative flex gap-x-6 p-4 duration-300 bg-white hover:bg-black"
                    onClick={() => handleSelect('template1')}
                  >
                    <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white group-hover:ring-white group-hover:bg-black group-hover:text-white duration-300 text-black ring-2 ring-black">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 icon icon-tabler icon-tabler-components"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M3 12l3 3l3 -3l-3 -3z"></path>
                        <path d="M15 12l3 3l3 -3l-3 -3z"></path>
                        <path d="M9 6l3 3l3 -3l-3 -3z"></path>
                        <path d="M9 18l3 3l3 -3l-3 -3z"></path>
                      </svg>
                    </div>
                    <div>
                      <a href="#_" className="font-semibold text-black group-hover:text-white duration-300">
                        Template 1
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-black group-hover:text-lila-500">
                        Description for template 1
                      </p>
                    </div>
                  </div>
                  <div
                    className="group relative flex gap-x-6 p-4 duration-300 bg-white hover:bg-black"
                    onClick={() => handleSelect('template2')}
                  >
                    <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white group-hover:ring-white group-hover:bg-black group-hover:text-white duration-300 text-black ring-2 ring-black">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 icon icon-tabler icon-tabler-components"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M3 12l3 3l3 -3l-3 -3z"></path>
                        <path d="M15 12l3 3l3 -3l-3 -3z"></path>
                        <path d="M9 6l3 3l3 -3l-3 -3z"></path>
                        <path d="M9 18l3 3l3 -3l-3 -3z"></path>
                      </svg>
                    </div>
                    <div>
                      <a href="#_" className="font-semibold text-black group-hover:text-white duration-300">
                        Template 2
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-black group-hover:text-lila-500">
                        Description for template 2
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