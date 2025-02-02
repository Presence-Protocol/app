"use client"

import React, { useEffect, useState } from 'react';
import { web3, Contract, MINIMAL_CONTRACT_DEPOSIT, DUST_AMOUNT, Subscription, contractIdFromAddress, addressFromContractId, NetworkId } from '@alephium/web3'
import { PoapFactory, PoapFactoryTypes } from '../../../../contracts/artifacts/ts/PoapFactory'
import { toast } from 'react-hot-toast'
import { useWallet } from '@alephium/web3-react'
import { stringToHex } from '@alephium/web3'
import { loadDeployments } from 'my-contracts/deployments';
import Link from 'next/link';

const MAX_TITLE_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 180;

export default function NewEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdContractAddress, setCreatedContractAddress] = useState<string | null>(null);
  const { account, signer } = useWallet()
  const [creationProgress, setCreationProgress] = useState<'idle' | 'submitting' | 'mining' | 'complete'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreationProgress('submitting');

    try {
      if (!account?.address) {
        throw new Error('Please connect your wallet first')
      }

      if (!signer) {
        throw new Error('Signer not available')
      }

      // Validate input lengths
      if (title.length > MAX_TITLE_LENGTH) {
        throw new Error(`Event name must be ${MAX_TITLE_LENGTH} characters or less`)
      }

      if (description.length > MAX_DESCRIPTION_LENGTH) {
        throw new Error(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`)
      }

      // Convert dates to millisecond timestamps (no need to multiply by 1000)
      const eventStartAt = BigInt(new Date(startDate).getTime());
      const eventEndAt = BigInt(new Date(endDate).getTime());
      
      // Set mint period same as event period for now
      const mintStartAt = eventStartAt;
      const mintEndAt = eventEndAt;

      // Initialize contract
      const deployment = loadDeployments( process.env.NEXT_PUBLIC_NETWORK as NetworkId ?? 'testnet'); // TODO use getNetwork()
      const factoryContract = PoapFactory.at(deployment.contracts.PoapFactory.contractInstance.address);

      // Convert strings to hex format
      const imageUri = stringToHex(previewImage || '');
      const imageSvg = stringToHex(''); // If you have SVG version
      const eventName = stringToHex(title);
      const descriptionHex = stringToHex(description);
      const locationHex = stringToHex(location);
      console.log(previewImage)
      // Call contract method using transact
      const result = await factoryContract.transact.mintNewCollection({
        args: {
          eventImage: imageUri,
          maxSupply: BigInt(amount),
          mintStartAt,
          mintEndAt,
          eventName,
          description: descriptionHex,
          location: locationHex,
          eventStartAt,
          eventEndAt,
          totalSupply: BigInt(0)
        },
        signer: signer,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT+DUST_AMOUNT,
      });

      setTxHash(result.txId);
      setCreationProgress('mining');
      
      toast.success('Transaction submitted! Waiting for confirmation...');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create event. Please try again.');
      setCreationProgress('idle');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log('Setting up node provider...');
   web3.setCurrentNodeProvider(
      process.env.NEXT_PUBLIC_NODE_URL ?? "https://node.testnet.alephium.org",
      undefined,
      undefined
    );
    console.log('Node provider setup complete');
  }, []);

  // Event subscription with logging
  useEffect(() => {
    const deployment = loadDeployments(process.env.NEXT_PUBLIC_NETWORK as NetworkId ?? 'testnet'); // TODO use getNetwork()
      const factoryContract = PoapFactory.at(deployment.contracts.PoapFactory.contractInstance.address);

    async function subscribeEvents() {
      console.log('Setting up event subscriptions, event length:', await factoryContract.getContractEventsCurrentCount());
      const currentEventCount = await factoryContract.getContractEventsCurrentCount()
      const events = factoryContract.subscribeEventCreatedEvent({
        pollingInterval: 5000,
        messageCallback: async (event) => {
          if(event.fields.organizer == account?.address) {
            const contractAddress = addressFromContractId(event.fields.contractId);
            console.log('Event created:', event);
            console.log(`Contract created by ${account?.address} has address ${contractAddress}`);
            setCreatedContractAddress(contractAddress);
            setCreationProgress('complete');
            toast.success('POAP created successfully!');
          }
          return Promise.resolve(); 
        },
        errorCallback: (error, subscription) => {
          console.error(`Error from contract factory:`, error);
          subscription.unsubscribe();
          return Promise.resolve();
        }
      }, currentEventCount)
    }
    subscribeEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add location input field in the form
  const locationInput = (
    <div className="border-2 border-black divide-black shadow rounded-xl overflow-hidden">
      <div>
        <label htmlFor="location" className="sr-only">Location</label>
        <input
          id="location"
          type="text"
          placeholder="Event Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="block w-full px-3 py-4 text-xl text-black border-2 border-transparent appearance-none placeholder-black border-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm"
        />
      </div>
    </div>
  );

  const renderProgress = () => {
    if (creationProgress === 'idle') return null;

    return (
      <div className="border-2 border-black divide-black shadow rounded-xl overflow-hidden bg-lila-100 p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-black">Creating your POAP</p>
            {creationProgress === 'complete' ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${creationProgress === 'idle' ? 'bg-gray-300' : 'bg-green-500'}`}></div>
              <span className="text-xs">Preparing transaction</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${creationProgress === 'mining' || creationProgress === 'complete' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs">Transaction submitted</span>
              {txHash && (
                <a 
                  href={`https://explorer.alephium.org/transactions/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View transaction
                </a>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${creationProgress === 'complete' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs">Contract deployment complete</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section>
      <div className="mx-auto mt-">
        <div className="relative justify-center max-h-[calc(100vh-82px)] lg:max-h-[calc(100vh-82px)] md:max-h-[calc(100vh-58px)] lg:px-0 md:px-12 grid lg:grid-cols-5 h-screen lg:divide-x-2 divide-black">
          <div className="hidden bg-lila-500 lg:col-span-2 lg:block lg:flex-1 lg:relative sm:contents">
            <div className="absolute inset-0 object-cover w-full h-full bg-lila-300">
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-full max-w-lg p-8 text-center fixed">
                  <div className="w-64 h-64 mx-auto rounded-2xl border-2 border-black shadow bg-white">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No image uploaded</div>
                    )}
                  </div>
                  <h3 className="mt-6 text-2xl font-medium text-black">{title || 'POAP Title Preview'}</h3>
                  <p className="mt-2 text-sm text-black">{description || 'Description Preview'}</p>
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-lila-300 focus:bg-lila-600 border-lila-600 duration-300 outline-none focus:shadow-none border-2 sm:w-auto py-3 rounded-lg h-8 tracking-wide focus:translate-y-1 hover:bg-lila-500"
                    >
                      Mint Amount: {amount}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col flex-1 px-4 py-10 bg-white-500 lg:py-24 md:flex-none md:px-28 sm:justify-center lg:col-span-3">
            <div className="w-full mx-auto md:px-0 sm:px-4 text-center">
              <h2 className="text-2xl lg:text-4xl font-semibold text-black max-w-4xl">
                Create New Presence Event
              </h2>

              <p className="text-lg text-black tracking-wide mt-4 text-balance">
                Create a new POAP for your event, community or yourself!
              </p>

              <form className="mt-6" onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="border-2 border-black divide-black shadow rounded-xl overflow-hidden">
                    <div>
                      <label htmlFor="title" className="sr-only">Title</label>
                      <input
                        id="title"
                        type="text"
                        placeholder="POAP Title"
                        value={title}
                        maxLength={MAX_TITLE_LENGTH}
                        onChange={(e) => setTitle(e.target.value)}
                        className="block w-full px-3 py-4 text-xl text-black border-2 border-transparent appearance-none placeholder-black border-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm"
                      />
                      <div className="px-3 py-1 text-sm text-gray-500">
                        {title.length}/{MAX_TITLE_LENGTH} characters
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-black divide-black shadow rounded-xl overflow-hidden">
                    <div>
                      <label htmlFor="description" className="sr-only">Description</label>
                      <textarea
                        id="description"
                        placeholder="POAP Description"
                        value={description}
                        maxLength={MAX_DESCRIPTION_LENGTH}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="block w-full px-3 py-4 text-xl text-black border-2 border-transparent appearance-none placeholder-black border-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm"
                      />
                      <div className="px-3 py-1 text-sm text-gray-500">
                        {description.length}/{MAX_DESCRIPTION_LENGTH} characters
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="border-2 border-black divide-black shadow rounded-xl overflow-hidden">
                      <div>
                        <label htmlFor="amount" className="sr-only">Amount</label>
                        <input
                          id="amount"
                          type="number"
                          min="1"
                          placeholder="Number of POAPs to mint"
                          value={amount || ''}
                          onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                          className="block w-full px-3 py-4 text-xl text-black border-2 border-transparent appearance-none placeholder-black border-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="border-2 border-black divide-black shadow rounded-xl overflow-hidden">
                      <div>
                        <label htmlFor="startDate" className="sr-only">Start Date</label>
                        <input
                          id="startDate"
                          type="date"
                          placeholder="Start Date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="block w-full px-3 py-4 text-xl text-black border-2 border-transparent appearance-none placeholder-black border-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="border-2 border-black divide-black shadow rounded-xl overflow-hidden">
                      <div>
                        <label htmlFor="endDate" className="sr-only">End Date</label>
                        <input
                          id="endDate"
                          type="date"
                          placeholder="End Date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="block w-full px-3 py-4 text-xl text-black border-2 border-transparent appearance-none placeholder-black border-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-black divide-black shadow rounded-xl overflow-hidden">
                    <div>
                      <label htmlFor="file-upload" className="sr-only">Upload POAP Image</label>
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="file-upload" className="relative cursor-pointer w-full">
                          <div className="flex flex-col items-center justify-center p-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-black mb-2" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                              <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                              <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
                              <path d="M12 11v6"></path>
                              <path d="M9.5 13.5l2.5 -2.5l2.5 2.5"></path>
                            </svg>
                            <p className="text-sm text-black">Upload POAP Image (PNG, JPG, GIF up to 10MB)</p>
                          </div>
                          <input 
                            id="file-upload" 
                            name="file-upload" 
                            type="file" 
                            className="sr-only" 
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {locationInput}

                  {renderProgress()}

                  {createdContractAddress && (
                    <div className="border-2 border-black divide-black shadow rounded-xl overflow-hidden bg-lila-100 p-4">
                      <p className="text-sm font-medium text-black">POAP Created Successfully!</p>
                      <p className="text-xs break-all mt-1">
                        Share this link with your attendees: <Link href={`/mint-nft/#id=${createdContractAddress}`}>{createdContractAddress}</Link>
                      </p>
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting || creationProgress !== 'idle'}
                      className={`text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:text-lila-800 ${(isSubmitting || creationProgress !== 'idle') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? 'Creating...' : 'Create POAP'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
