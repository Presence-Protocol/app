"use client"

import React, { useEffect, useState } from 'react';
import { web3, Contract, MINIMAL_CONTRACT_DEPOSIT, DUST_AMOUNT, Subscription, contractIdFromAddress, addressFromContractId, NetworkId } from '@alephium/web3'
import { PoapFactory, PoapFactoryTypes } from '../../../../contracts/artifacts/ts/PoapFactory'
import { toast } from 'react-hot-toast'
import { useWallet } from '@alephium/web3-react'
import { stringToHex } from '@alephium/web3'
import { loadDeployments } from 'my-contracts/deployments';
import Link from 'next/link';
import PoapProgress, { ProgressStep } from './PoapProgress';
import LargeImageWarning from '../Modals/LargeImageWarning';
import MintAmountInfo from '../Modals/MintAmountInfo';
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
  const [creationProgress, setCreationProgress] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progressState, setProgressState] = useState<{
    currentStep: ProgressStep;
    txHash?: string;
    contractAddress?: string;
  }>({
    currentStep: 'preparing'
  });
  const [isImageValid, setIsImageValid] = useState(true);
  const [isLargeImageWarningOpen, setIsLargeImageWarningOpen] = useState(false);
  const [isMintAmountInfoOpen, setIsMintAmountInfoOpen] = useState(false);
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [isPublicEvent, setIsPublicEvent] = useState(false);
  const [mintLimit, setMintLimit] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3072) {
        setIsLargeImageWarningOpen(true);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setIsImageValid(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchImageFromUrl = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL must point to an image');
      }
      
      /*if (blob.size > 3072) {
        setIsLargeImageWarningOpen(true);
        return;
      }*/
  
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setIsImageValid(true);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      toast.error('Failed to load image from URL');
      setIsImageValid(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    
    if (!imageUrl.match(/^https?:\/\/.+/)) {
      toast.error('Please enter a valid URL');
      return;
    }
    
    await fetchImageFromUrl(imageUrl);
    setImageUrl('');
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setIsImageValid(true);
  };

  const isFormValid = () => {
    const now = new Date().getTime();
    const eventStart = new Date(eventStartDate).getTime();
    const eventEnd = new Date(eventEndDate).getTime();
    const mintStart = new Date(startDate).getTime();
    const mintEnd = new Date(endDate).getTime();


    return (
      title.length > 0 &&
      title.length <= MAX_TITLE_LENGTH &&
      description.length > 0 &&
      description.length <= MAX_DESCRIPTION_LENGTH &&
      amount > 0 &&
      startDate.length > 0 &&
      endDate.length > 0 &&
      eventStartDate.length > 0 &&
      eventEndDate.length > 0 &&
      location.length > 0 &&
      isImageValid &&
      eventEnd > eventStart &&
      mintEnd > mintStart
  
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsProgressOpen(true);
    setProgressState({ currentStep: 'preparing' });

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

      // Add date validation
      const now = new Date().getTime();
      const eventStart = new Date(eventStartDate).getTime();
      const eventEnd = new Date(eventEndDate).getTime();
      const mintStart = new Date(startDate).getTime();
      const mintEnd = new Date(endDate).getTime();

      if (eventEnd <= eventStart) {
        throw new Error('Event end date must be after event start date');
      }

      if (mintEnd <= mintStart) {
        throw new Error('Minting end date must be after minting start date');
      }

      /*
      if (mintStart < now) {
        throw new Error('Minting start date cannot be in the past');
      }

      if (eventStart < now) {
        throw new Error('Event start date cannot be in the past');
      }*/

      // Convert dates to millisecond timestamps (no need to multiply by 1000)
      const eventStartAt = BigInt(new Date(eventStartDate).getTime());
      const eventEndAt = BigInt(new Date(eventEndDate).getTime());
      const mintStartAt = BigInt(new Date(startDate).getTime());
      const mintEndAt = BigInt(new Date(endDate).getTime());

      // Initialize contract
      const deployment = loadDeployments( process.env.NEXT_PUBLIC_NETWORK as NetworkId ?? 'testnet'); // TODO use getNetwork()
      const factoryContract = PoapFactory.at(deployment.contracts.PoapFactory.contractInstance.address);

      // Convert strings to hex format
      const imageUri = stringToHex(previewImage || '');
      const imageSvg = stringToHex(''); // If you have SVG version
      const eventName = stringToHex(title);
      const descriptionHex = stringToHex(description);
      const locationHex = stringToHex(location);

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
          totalSupply: BigInt(0),
          isPublic: isPublicEvent,
          oneMintPerAddress: mintLimit,
          isBurnable: false,
          amountForStorageFees: 0n
        },
        signer: signer,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT+DUST_AMOUNT,
      });

      setProgressState({ 
        currentStep: 'submitted', 
        txHash: result.txId 
      });
      
      // Clear all form fields after successful submission
      setTitle('');
      setDescription('');
      setAmount(0);
      setStartDate('');
      setEndDate('');
      setLocation('');
      setPreviewImage(null);
      setIsPublicEvent(false);
      setMintLimit(false);
      
      toast.success('Transaction submitted! Waiting for confirmation...');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create event. Please try again.');
      setIsProgressOpen(false);
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
            setProgressState({
              currentStep: 'completed',
              txHash: txHash ?? undefined,
              contractAddress
            });
            toast.success('Event created successfully!');
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
    <div className="border-2 border-black divide-black shadow rounded-2xl overflow-hidden">
      <div>
        <label htmlFor="location" className="sr-only">Location</label>
        <input
          id="location"
          type="text"
          placeholder="Event Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="block w-full px-3 py-3 text-xl text-black border-2 border-transparent appearance-none rounded-2xl placeholder-black border-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm"
        />
      </div>
    </div>
  );

  const renderProgress = () => {
    if (creationProgress === false) return null;

    return (
      <div className="border-2 border-black divide-black shadow rounded-2xl overflow-hidden bg-lila-100 p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-black">Creating your Event</p>
            {creationProgress === true ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${creationProgress === true ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-xs">Preparing transaction</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${creationProgress === true ? 'bg-green-500' : 'bg-gray-300'}`}></div>
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
              <div className={`w-2 h-2 rounded-full ${creationProgress === true ? 'bg-green-500' : 'bg-gray-300'}`}></div>
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
              <div className="w-full h-[calc(100vh-82px)] flex flex-col items-center justify-center">
                
                <div className="w-full max-w-lg p-8 text-center fixed">
                  <div className="w-64 h-64 mx-auto rounded-2xl border-2 border-black shadow bg-white">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No image uploaded</div>
                    )}
                  </div>
                  <h3 className="mt-6 text-2xl font-medium text-black">{title || 'Event Title Preview'}</h3>
                  <p className="mt-2 text-sm text-black">{description || 'Description Preview'}</p>
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-lila-300 focus:bg-lila-600 border-lila-600 duration-300 outline-none focus:shadow-none border-2 sm:w-auto py-3 rounded-2xl h-8 tracking-wide focus:translate-y-1 hover:bg-lila-500"
                    >
                      Mint Amount: {amount}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col flex-1 px-4 py-10 bg-white-500 lg:py-24 md:flex-none md:px-28 sm:justify-center lg:col-span-3">
            {isProgressOpen ? (
              <div className="w-full mx-auto md:px-0 sm:px-4">
                
                <div className="w-full max-w-xl mx-auto">
                  <PoapProgress 
                    isOpen={true}
                    onClose={() => {}}
                    progress={progressState}
                  />
                  
                  {progressState.currentStep === 'completed' && (
                    <button
                      onClick={() => setIsProgressOpen(false)}
                      className="mt-8 text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-3 rounded-2xl h-16 tracking-wide focus:translate-y-1 w-full hover:text-lila-800"
                    >
                      Create New Event
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-xl mx-auto lg:min-w-[500px] md:px-0 sm:px-4 text-center">
                <h2 className="text-2xl lg:text-3xl font-semibold text-black max-w-4xl mb-1">
                  Create Presence Event
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Create a New Event & Share your Presence
                </p>
       

                <form className="mt-6" onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div className="border-2 border-black divide-black shadow rounded-2xl overflow-hidden">
                      <div>
                        <label htmlFor="title" className="sr-only">Title</label>
                        <input
                          id="title"
                          type="text"
                          placeholder="Event Title"
                          value={title}
                          maxLength={MAX_TITLE_LENGTH}
                          onChange={(e) => setTitle(e.target.value)}
                          className="block w-full px-3 py-3 text-xl text-black border-2 border-transparent appearance-none placeholder-black border-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm rounded-2xl"
                        />
                        <div className="px-3 py-1 text-sm text-gray-500">
                          {title.length}/{MAX_TITLE_LENGTH} characters
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-black divide-black shadow rounded-2xl overflow-hidden">
                      <div>
                        <label htmlFor="description" className="sr-only">Description</label>
                        <textarea
                          id="description"
                          placeholder="Event Description"
                          value={description}
                          maxLength={MAX_DESCRIPTION_LENGTH}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="block w-full px-3 py-3 text-xl text-black border-2 border-transparent appearance-none placeholder-black border-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm rounded-2xl"
                        />
                        <div className="px-3 py-1 text-sm text-gray-500">
                          {description.length}/{MAX_DESCRIPTION_LENGTH} characters
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="border-2 border-black divide-black shadow rounded-2xl overflow-hidden">
                        <div>
                          <label htmlFor="location" className="sr-only">Location</label>
                          <input
                            id="location"
                            type="text"
                            placeholder="Event Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="block w-full px-3 py-3 text-xl text-black border-2 border-transparent appearance-none rounded-2xl placeholder-black border-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="border-2 border-black divide-black shadow rounded-2xl overflow-hidden">
                        <div className="relative">
                          <label htmlFor="amount" className="sr-only">Amount</label>
                          <input
                            id="amount"
                            type="number"
                            min="1"
                            placeholder="Presence Amount"
                            value={amount || ''}
                            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                            className="block w-full px-3 py-3 text-xl text-black border-2 border-transparent appearance-none placeholder-black border-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm rounded-2xl pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setIsMintAmountInfoOpen(true)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-800 hover:text-black"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              stroke="currentColor"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                              <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                              <path d="M12 8l.01 0" />
                              <path d="M11 12l1 0l0 4l1 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="border-2 border-black divide-black shadow rounded-2xl overflow-hidden">
                          <div>
                            <label htmlFor="eventStartDate" className="block px-3 pt-2 pb-2 text-sm text-gray-600">Event Start Date</label>
                            <input
                              id="eventStartDate"
                              type="date"
                              placeholder="Event Start Date"
                              value={eventStartDate}
                              onChange={(e) => setEventStartDate(e.target.value)}
                              className="block w-full px-3 py-2 text-xl text-black border-2 border-transparent appearance-none placeholder-black border-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm rounded-2xl"
                            />
                          </div>
                        </div>

                        <div className="border-2 border-black divide-black shadow rounded-2xl overflow-hidden">
                          <div>
                            <label htmlFor="eventEndDate" className="block px-3 pt-2 pb-2 text-sm text-gray-600">Event End Date</label>
                            <input
                              id="eventEndDate"
                              type="date"
                              placeholder="Event End Date"
                              value={eventEndDate}
                              onChange={(e) => setEventEndDate(e.target.value)}
                              className="block w-full px-3 py-2 text-xl text-black border-2 border-transparent appearance-none placeholder-black border-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm rounded-2xl"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="border-2 border-black divide-black shadow rounded-2xl overflow-hidden">
                          <div>
                            <label htmlFor="startDate" className="block px-3 pt-2 pb-2 text-sm text-gray-600">Start Minting Date</label>
                            <input
                              id="startDate"
                              type="date"
                              placeholder="Start Minting Date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="block w-full px-3 py-2 text-xl text-black border-2 border-transparent appearance-none placeholder-black border-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm rounded-2xl"
                            />
                          </div>
                        </div>

                        <div className="border-2 border-black divide-black shadow rounded-2xl overflow-hidden">
                          <div>
                            <label htmlFor="endDate" className="block px-3 pt-2 pb-2 text-sm text-gray-600">End Minting Date</label>
                            <input
                              id="endDate"
                              type="date"
                              placeholder="End Minting Date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="block w-full px-3 py-2 text-xl text-black border-2 border-transparent appearance-none placeholder-black border-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm rounded-2xl"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-black divide-black shadow rounded-2xl overflow-hidden">
                      <div>
                        <label htmlFor="file-upload" className="sr-only">Upload Event Image</label>
                        <div className="flex items-center justify-center w-full">
                          {previewImage ? (
                            <div className="relative w-full bg-lila-100">
                              <img 
                                src={previewImage} 
                                alt="Preview" 
                                className="w-full h-[100px] object-contain"
                              />
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-black shadow-sm hover:bg-red-600 transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <label htmlFor="file-upload" className="relative cursor-pointer w-full">
                              <div className="flex flex-col items-center justify-center p-6 min-h-[100px]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-black mb-2" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                  <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                                  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
                                  <path d="M12 11v6"></path>
                                  <path d="M9.5 13.5l2.5 -2.5l2.5 2.5"></path>
                                </svg>
                                <p className="text-sm text-black">Upload Event Image (PNG, JPG, GIF up to 10MB)</p>
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
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Or paste image URL"
                        className="w-full p-2 border rounded"
                      />
                      &nbsp;
                      <button 
                        onClick={handleUrlSubmit}
                        className="w-full px-3 py-3 text-xl text-black border-2 border-black appearance-none rounded-2xl hover:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm shadow"
                      >
                        Load from URL
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-left justify-between p-4">
                        <div>
                          <h3 className="text-sm font-medium text-black">{isPublicEvent ? 'Public Event' : 'Private Event'}</h3>
                          <p className="text-xs text-gray-500">{isPublicEvent ? 'Anyone will be able to see your Presence' : 'Presence will not appear on Presence Explorer'}</p>
                        </div>
                        <div className="items-center inline-flex">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isPublicEvent}
                            onClick={() => setIsPublicEvent(!isPublicEvent)}
                            className={`relative inline-flex w-10 rounded-full py-1 transition border-2 shadow-small border-black ${
                              isPublicEvent ? 'bg-lila-400' : 'bg-white'
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full transition shadow-md ${
                                isPublicEvent ? 'translate-x-6 bg-lila-800' : 'translate-x-1 bg-gray-500'
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center text-left justify-between p-4">
                        <div>
                          <h3 className="text-sm font-medium text-black">{mintLimit ? 'Limit Address Presence' : 'No Limit'}</h3>
                          <p className="text-xs text-gray-500">{mintLimit ? 'This will limit the number of Presence per address to 1' : 'There is no limit to the number of Presence per address'}</p>
                        </div>
                        <div className="items-center inline-flex">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={mintLimit}
                            onClick={() => setMintLimit(!mintLimit)}
                            className={`relative inline-flex w-10 rounded-full py-1 transition border-2 shadow-small border-black ${
                              mintLimit ? 'bg-lila-400' : 'bg-white'
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full transition shadow-md ${
                                mintLimit ? 'translate-x-6 bg-lila-800' : 'translate-x-1 bg-gray-500'
                              }`}
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {renderProgress()}

                    {createdContractAddress && (
                      <div className="border-2 border-black divide-black shadow rounded-2xl overflow-hidden bg-lila-100 p-4">
                        <p className="text-sm font-medium text-black">Event Created Successfully!</p>
                        <p className="text-xs break-all mt-1">
                          Share this link with your attendees: <Link href={`/mint-presence/#id=${createdContractAddress}`}>{createdContractAddress}</Link>
                        </p>
                      </div>
                    )}

                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting || !isFormValid()}
                        className={`text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-3 rounded-2xl h-16 tracking-wide focus:translate-y-1 w-full hover:text-lila-800 ${(isSubmitting || creationProgress !== false || !isFormValid()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting ? 'Creating...' : isFormValid() ? 'Create Event' : 'Please fill out all fields'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <LargeImageWarning 
        isOpen={isLargeImageWarningOpen} 
        onClose={() => setIsLargeImageWarningOpen(false)} 
      />
      <MintAmountInfo 
        isOpen={isMintAmountInfoOpen}
        onClose={() => setIsMintAmountInfoOpen(false)}
      />
    </section>
  );
}