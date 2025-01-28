import BaseLayout from "./BaseLayout";
import { useState } from "react";

interface IntegrationsLayoutProps {
  children: React.ReactNode;
  frontmatter: {
    logo: {
      url: string;
      alt: string;
    };
    integration: string;
    description: string;
    permissions: string[];
  };
}

export default function IntegrationsLayout({ children, frontmatter }: IntegrationsLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <BaseLayout>
      <section className="border-t-0 border-b-2 border-black  mx-auto">
        <div className="p-8 lg:p-20 2xl:border-x-2 border-black bg-lila-500">
          <div className="grid gird-cols-1 lg:grid-cols-5 border-2 border-black shadow-large shadow-black rounded-3xl overflow-hidden lg:divide-x-2 divide-black">
            <div className="bg-yellow-500 divide-black divide-y-2">
              <div className="p-8">
                <div>
                  <div className="flex gap-4 items-center">
                    <img
                      className="size-8"
                      src={frontmatter.logo.url}
                      alt={frontmatter.logo.alt}
                    />
                    <p className="text-xl lg:text-2xl font-medium text-black">
                      {frontmatter.integration}
                    </p>
                  </div>
                  <p className="mt-4 text-sm max-w-xl tracking-wide text-black">
                    {frontmatter.description}
                  </p>
                  <div className="mt-8">
                    <button
                      onClick={() => setIsOpen(true)}
                      type="button"
                      className="text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:text-lila-800">
                      Connect
                    </button>
                    {isOpen && (
                      <div
                        role="dialog"
                        aria-modal="true"
                        className="fixed inset-0 z-10 overflow-y-auto w-full">
                        <div className="fixed inset-0 bg-lila-500 bg-opacity-50 w-full" />
                        <div
                          onClick={() => setIsOpen(false)}
                          className="relative flex min-h-svh items-center justify-center p-4">
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-xl overflow-y-auto divide-y-2 divide-black ring-2 ring-inset ring-black text-black bg-white shadow-small rounded-xl">
                            <div className="p-8">
                              <p className="text-3xl font-medium text-black">
                                Connect {frontmatter.integration} to Flabbergasted
                              </p>
                              <p className="mt-6 xl:text-xl tracking-wide text-black">
                                Give priority to tasks and projects based on the
                                requirements of your customers, and establish a closer
                                feedback loop with them.
                              </p>
                            </div>
                            <div className="mt-6 text-left p-8">
                              <p className="font-semibold text-black text-2xl lg:text-2xl">
                                {frontmatter.integration} would like to:
                              </p>
                              <ul className="mt-6 tracking-wide space-y-2 text-black" role="list">
                                {frontmatter.permissions.map((permission, index) => (
                                  <li key={index} className="flex items-center gap-3">
                                    <svg
                                      className="size-6"
                                      viewBox="0 0 36 36"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg">
                                      <path
                                        d="M5.22789 16.8936H4.22789V18.8936H5.22789V16.8936ZM31.2279 18.8936C31.7802 18.8936 32.2279 18.4459 32.2279 17.8936C32.2279 17.3413 31.7802 16.8936 31.2279 16.8936V18.8936ZM22.2279 7.89362V6.89362H20.2279V7.89362H22.2279ZM30.6485 18.671C31.1334 18.9355 31.7408 18.7568 32.0053 18.2719C32.2697 17.7871 32.0911 17.1797 31.6062 16.9152L30.6485 18.671ZM20.2278 27.7931V28.7931H22.2278V27.7931H20.2278ZM5.22789 18.8936H31.1273V16.8936H5.22789V18.8936ZM31.1273 18.8936H31.2279V16.8936H31.1273V18.8936ZM20.2279 7.89362C20.2279 9.36603 21.0232 10.7723 21.9994 11.9705C22.9957 13.1932 24.2995 14.3434 25.5662 15.3222C26.8387 16.3055 28.1063 17.1406 29.0529 17.7286C29.5271 18.0232 29.9231 18.2571 30.2017 18.4181C30.341 18.4987 30.4511 18.561 30.5272 18.6037C30.5653 18.625 30.5948 18.6414 30.6152 18.6527C30.6254 18.6583 30.6334 18.6627 30.6389 18.6658C30.6417 18.6673 30.6439 18.6685 30.6455 18.6694C30.6463 18.6698 30.647 18.6702 30.6475 18.6704C30.6477 18.6706 30.648 18.6707 30.6481 18.6708C30.6484 18.6709 30.6485 18.671 31.1274 17.7931C31.6062 16.9152 31.6063 16.9153 31.6064 16.9153C31.6064 16.9153 31.6064 16.9153 31.6064 16.9153C31.6063 16.9152 31.606 16.9151 31.6056 16.9149C31.6048 16.9144 31.6034 16.9137 31.6015 16.9126C31.5975 16.9104 31.5913 16.907 31.5828 16.9023C31.5657 16.8929 31.5397 16.8784 31.5052 16.8591C31.4363 16.8204 31.3337 16.7624 31.2024 16.6865C30.9396 16.5346 30.5621 16.3116 30.1083 16.0297C29.1987 15.4647 27.9914 14.6686 26.7891 13.7396C25.5809 12.806 24.4098 11.7626 23.5499 10.7072C22.67 9.62732 22.2279 8.6712 22.2279 7.89362H20.2279ZM31.1273 17.8936C30.7527 16.9664 30.7524 16.9666 30.7521 16.9667C30.7519 16.9667 30.7516 16.9669 30.7513 16.967C30.7507 16.9673 30.7499 16.9676 30.749 16.9679C30.7472 16.9687 30.7447 16.9697 30.7417 16.9709C30.7357 16.9734 30.7273 16.9768 30.7166 16.9812C30.6953 16.99 30.6648 17.0028 30.6258 17.0193C30.5478 17.0524 30.4356 17.1007 30.2941 17.1639C30.0113 17.2903 29.6105 17.4762 29.1309 17.7176C28.1742 18.1991 26.8918 18.9078 25.603 19.8126C24.3193 20.7138 22.9944 21.8337 21.9824 23.1472C20.9694 24.4621 20.2278 26.0278 20.2278 27.7931H22.2278C22.2278 26.6087 22.7237 25.4621 23.5668 24.3678C24.411 23.272 25.5609 22.2858 26.7521 21.4495C27.9382 20.6169 29.1306 19.9568 30.0301 19.504C30.4786 19.2782 30.8512 19.1055 31.1097 18.9901C31.2389 18.9324 31.3394 18.8891 31.4064 18.8607C31.4399 18.8465 31.465 18.836 31.4812 18.8293C31.4892 18.826 31.495 18.8236 31.4985 18.8222C31.5003 18.8215 31.5014 18.821 31.502 18.8208C31.5023 18.8206 31.5024 18.8206 31.5024 18.8206C31.5024 18.8206 31.5023 18.8206 31.5023 18.8206C31.5021 18.8207 31.5019 18.8208 31.1273 17.8936Z"
                                        fill="currentColor"
                                      />
                                    </svg>
                                    {permission}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="p-8 flex space-x-2">
                              <button
                                onClick={() => setIsOpen(false)}
                                type="button"
                                className="text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white sm:w-auto py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:text-lila-800 ml-auto">
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="text-black items-center shadow shadow-lila-600 text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-lila-300 focus:bg-lila-600 border-lila-600 duration-300 outline-none focus:shadow-none border-2 sm:w-auto py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:bg-lila-50">
                                Allow access
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 p-8 lg:p-20 bg-white">
              <div className="prose-styles">{children}</div>
            </div>
          </div>
        </div>
      </section>
    </BaseLayout>
  );
}
