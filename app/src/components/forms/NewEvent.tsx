"use client"

import React, { useEffect, useState } from 'react';
import { web3, Contract, MINIMAL_CONTRACT_DEPOSIT, DUST_AMOUNT, Subscription, contractIdFromAddress, addressFromContractId, NetworkId, ALPH_TOKEN_ID } from '@alephium/web3'
import { PoapFactory, PoapFactoryTypes } from '../../../../contracts/artifacts/ts/PoapFactory'
import { toast } from 'react-hot-toast'
import { useWallet } from '@alephium/web3-react'
import { stringToHex } from '@alephium/web3'
import { loadDeployments } from 'my-contracts/deployments';
import Link from 'next/link';
import PoapProgress, { ProgressStep } from './PoapProgress';
import LargeImageWarning from '../Modals/LargeImageWarning';
import MintAmountInfo from '../Modals/MintAmountInfo';
import StorageFeesInfo from '../Modals/StorageFeesInfo';
import PoapFeesInfo from '../Modals/PoapFeesInfo';
import TokenIdInfo from '../Modals/TokenIdInfo';
import PresencePriceInfo from '../Modals/PresencePriceInfo';
import BurnableInfo from '../Modals/BurnableInfo';
import Tooltip from '../ui/Tooltip';
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
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('url');
  const [isBurnable, setIsBurnable] = useState(false);
  const [poapPrice, setPoapPrice] = useState(0n);
  const [storageFees, setStorageFees] = useState(0n);
  const [poapFees, setPoapFees] = useState(0n);
  const [tokenId, setTokenId] = useState(ALPH_TOKEN_ID);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isStorageFeesInfoOpen, setIsStorageFeesInfoOpen] = useState(false);
  const [isPoapFeesInfoOpen, setIsPoapFeesInfoOpen] = useState(false);
  const [isTokenIdInfoOpen, setIsTokenIdInfoOpen] = useState(false);
  const [isPresencePriceInfoOpen, setIsPresencePriceInfoOpen] = useState(false);
  const [isBurnableInfoOpen, setIsBurnableInfoOpen] = useState(false);

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
      previewImage !== null &&
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
          isBurnable: isBurnable,
          amountForStorageFees: storageFees,
          poapPrice: poapPrice,
          tokenIdPoap: tokenId,
          amountPoapFees: poapFees
        },
        signer: signer,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT+DUST_AMOUNT,
      });

      setProgressState({ 
        currentStep: 'submitted', 
        txHash: result.txId 
      });
      
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
    setTitle('');
    setDescription('');
    setAmount(0);
    setStartDate('');
    setEndDate('');
    setLocation('');
    setPreviewImage(null);
    setIsPublicEvent(false);
    setMintLimit(false);
    setEventStartDate('');
    setEventEndDate('');
    setImageUrl('');
    setActiveTab('url');
    setIsImageValid(true);
    setIsBurnable(false);
    setPoapPrice(0n);
    setStorageFees(0n);
    setPoapFees(0n);
    setTokenId(ALPH_TOKEN_ID);
    setShowAdvancedSettings(false);
  }, []);

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

  const advancedSettingsSection = (
    <div className="border-2 border-black divide-black shadow rounded-2xl overflow-hidden text-left">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer bg-white"
        onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
      >
        <div>
          <h3 className="text-sm font-medium text-black">Advanced Settings</h3>
          <p className="text-xs text-gray-500">Configure additional event parameters</p>
        </div>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${showAdvancedSettings ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {showAdvancedSettings && (
        <div className="divide-y-2 divide-black">
          <div className="flex items-center text-left justify-between p-4 bg-white">
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-sm font-medium text-black">Burnable Presence</h3>
                {/* <button
                  type="button"
                  onClick={() => setIsBurnableInfoOpen(true)}
                  className="ml-2"
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
                </button> */}
              </div>
              <p className="text-xs text-gray-500">Allow users to burn their Presence NFT</p>
            </div>
            <div className="items-center inline-flex">
              <button
                type="button"
                role="switch"
                aria-checked={isBurnable}
                onClick={() => setIsBurnable(!isBurnable)}
                className={`relative inline-flex w-10 rounded-full py-1 transition border-2 shadow-small border-black ${
                  isBurnable ? 'bg-lila-400' : 'bg-white'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full transition shadow-md ${
                    isBurnable ? 'translate-x-6 bg-lila-800' : 'translate-x-1 bg-gray-500'
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-black">Presence Price</label>
              <button
                type="button"
                onClick={() => setIsPresencePriceInfoOpen(true)}
                className="ml-2"
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
            <p className="text-xs text-gray-500 mb-2">Set a price for minting (in ALPH)</p>
            <input
              type="number"
              min="0"
              step="0.1"
              value={Number(poapPrice) / 10**18}
              onChange={(e) => setPoapPrice(BigInt(Math.floor(Number(e.target.value) * 10**18)))}
              className="block w-full px-3 py-3 text-xl text-black border-2 border-black appearance-none placeholder-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm rounded-2xl"
            />
          </div>

          <div className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-black">Storage Fees</label>
              <button
                type="button"
                onClick={() => setIsStorageFeesInfoOpen(true)}
                className="ml-2"
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
            <p className="text-xs text-gray-500 mb-2">Amount allocated for storage (in ALPH)</p>
            <input
              type="number"
              min="0"
              step="0.1"
              value={Number(storageFees) / 10**18}
              onChange={(e) => setStorageFees(BigInt(Math.floor(Number(e.target.value) * 10**18)))}
              className="block w-full px-3 py-3 text-xl text-black border-2 border-black appearance-none placeholder-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm rounded-2xl"
            />
          </div>

          <div className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-black">POAP Fees</label>
              <button
                type="button"
                onClick={() => setIsPoapFeesInfoOpen(true)}
                className="ml-2"
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
            <p className="text-xs text-gray-500 mb-2">Additional fees for POAP (in ALPH)</p>
            <input
              type="number"
              min="0"
              step="0.1"
              value={Number(poapFees) / 10**18}
              onChange={(e) => setPoapFees(BigInt(Math.floor(Number(e.target.value) * 10**18)))}
              className="block w-full px-3 py-3 text-xl text-black border-2 border-black appearance-none placeholder-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm rounded-2xl"
            />
          </div>

          <div className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-black">Token ID</label>
              <button
                type="button"
                onClick={() => setIsTokenIdInfoOpen(true)}
                className="ml-2"
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
            <p className="text-xs text-gray-500 mb-2">Token ID for the POAP (default: ALPH)</p>
            <input
              type="text"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="block w-full px-3 py-3 text-xl text-black border-2 border-black appearance-none placeholder-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <section>
        <div className="mx-auto mt-">
          <div className="relative justify-center max-h-[calc(100vh-82px)] lg:max-h-[calc(100vh-82px)] md:max-h-[calc(100vh-58px)] lg:px-0 md:px-12 grid lg:grid-cols-5 h-screen lg:divide-x-2 divide-black">
            <div className="hidden bg-lila-500 lg:col-span-2 lg:block lg:flex-1 lg:relative sm:contents">
              <div className="absolute inset-0 object-cover w-full h-full bg-lila-300">
                <div className="w-full h-[calc(100vh-82px)] flex flex-col items-center justify-center">
                  <div className="w-full max-w-lg p-8 text-center fixed">
                    <div className="relative w-64 h-64 mx-auto rounded-2xl border-2 border-black shadow bg-white">
                      {previewImage ? (
                        <>
                          <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                          {!isPublicEvent && (
                            <Tooltip text="Private Event">
                              <div className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </Tooltip>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No image uploaded</div>
                      )}
                    </div>
                    <h3 className="mt-6 text-2xl font-medium text-black">{title || 'Event Title Preview'}</h3>
                    <div className="mt-4 flex flex-col gap-4">
                      <div className="space-y-2">
                        <p className="mt-2 text-sm text-black">{description || 'Description Preview'}</p>
                        {location && (
                          <div className="flex items-center justify-center gap-2 text-sm">
                            <span className="text-gray-600">{location}</span>
                          </div>
                        )}
                      </div>

                      {/* <div className="bg-white border-2 shadow border-black rounded-xl p-4 mt-12"> */}
                        {/* <h3 className="text-sm font-medium text-black mb-3">Properties</h3> */}
                        
                       
                      {/* </div> */}

                      {(eventStartDate || eventEndDate) && (
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <span className="text-gray-600">
                            {eventStartDate && new Date(eventStartDate).toLocaleDateString()} - 
                            {eventEndDate && new Date(eventEndDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {(startDate || endDate) && (
                        <div className="text-xs text-gray-500">
                          Minting period: {startDate && new Date(startDate).toLocaleDateString()} - 
                          {endDate && new Date(endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 mt-8">
                      <div className="flex justify-center flex-wrap gap-2">
                        <Tooltip text="Total amount of Presence that can be minted">
                          <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-4 bg-lila-300 border-lila-600 border-2 py-2 rounded-lg h-8 tracking-wide">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 mr-1">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
                            </svg>
                            <span>Mint Amount: {amount}</span>
                            {mintLimit && (
                              <Tooltip text="Maximum 1 mint per address">
                                <span className="ml-2 bg-black text-white text-xs px-1 rounded">1/wallet</span>
                              </Tooltip>
                            )}
                          </div>
                        </Tooltip>

                        {Number(poapPrice) > 0 && (
                          <Tooltip text="Price to mint this Presence">
                            <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-4 bg-lila-300 border-lila-600 border-2 py-2 rounded-lg h-8 tracking-wide">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 mr-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                              </svg>
                              <span>{Number(poapPrice) / 10**18} ALPH</span>
                            </div>
                          </Tooltip>
                        )}

                        {Number(storageFees) > 0 && (
                          <Tooltip text="Storage fees for this Presence">
                            <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-4 bg-lila-300 border-lila-600 border-2 py-2 rounded-lg h-8 tracking-wide">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 mr-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                              </svg>
                              <span>{Number(storageFees) / 10**18} ALPH</span>
                            </div>
                          </Tooltip>
                        )}

                        {isBurnable && (
                          <Tooltip text="This Presence can be burned by its owner">
                            <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-3 bg-lila-300 border-lila-600 border-2 py-2 rounded-lg h-8 tracking-wide">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                              </svg>
                            </div>
                          </Tooltip>
                        )}

                        <Tooltip text={`This event is ${isPublicEvent ? 'visible to everyone' : 'only visible to specific addresses'}`}>
                          <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-4 bg-lila-300 border-lila-600 border-2 py-2 rounded-lg h-8 tracking-wide">
                            {isPublicEvent ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 mr-1">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                                <span>Public</span>
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 mr-1">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                                <span>Private</span>
                              </>
                            )}
                          </div>
                        </Tooltip>
                      </div>
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

                      <div className={`border-2 border-black ${previewImage !== null ? 'bg-lila-100' : 'bg-white'} divide-black shadow rounded-2xl overflow-hidden`}>
                        <div className="flex items-center justify-center border-b-2 border-black">
                          <button
                            type="button"
                            onClick={() => setActiveTab('url')}
                            disabled={previewImage !== null && activeTab !== 'url'}
                            className={`flex-1 py-3 px-6 focus:outline-none block text-sm ${
                              activeTab === 'url' 
                                ? 'bg-lila-100 border-r-2 border-black text-black' 
                                : 'bg-white text-gray-600'
                            } ${previewImage !== null && activeTab !== 'url' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            Event Image from URL
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('upload')}
                            disabled={previewImage !== null && activeTab !== 'upload'}
                            className={`flex-1 py-3 px-6 focus:outline-none block text-sm ${
                              activeTab === 'upload' 
                                ? 'bg-lila-100 border-l-2 border-black text-black' 
                                : 'bg-white text-gray-600'
                            } ${previewImage !== null && activeTab !== 'upload' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            Event Image from Upload
                          </button>
                        </div>

                        <div className="p-4">
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
                                className="absolute top-2 right-2 bg-red-800 -mt-2 -mr-2 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          ) : activeTab === 'url' ? (
                            <div className="flex flex-col justify-center min-h-[120px] max-h-[120px] space-y-3.5">
                              <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="Paste image URL here"
                                className="w-full p-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-lila-500"
                              />
                              <button 
                                onClick={handleUrlSubmit}
                                disabled={!imageUrl}
                                className={`w-full px-3 py-2 text-black border-2 border-black rounded-lg hover:bg-lila-500 focus:outline-none focus:ring-2 focus:ring-lila-500 shadow ${
                                  !imageUrl ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {imageUrl ? 'Load from URL' : 'Add URL to Load Image'}
                              </button>
                            </div>
                          ) : (
                            <label htmlFor="file-upload" className="relative cursor-pointer w-full">
                              <div className="flex flex-col items-center justify-center p-6 min-h-[120px] max-h-[120px]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-black mb-2" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                  <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                                  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
                                  <path d="M12 11v6"></path>
                                  <path d="M9.5 13.5l2.5 -2.5l2.5 2.5"></path>
                                </svg>
                                <p className="text-sm text-black">Upload Event Image (PNG, JPG, GIF up to 3KB)</p>
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


                    
                      <div className="space-y-2">
                        <div className="flex items-center text-left justify-between p-4">
                          <div>
                            <h3 className="text-sm font-medium text-black">{isPublicEvent ? 'Public Event' : 'Private Event'}</h3>
                            <p className="text-xs text-gray-500">{isPublicEvent ? 'Anyone will be able to see your Presence' : 'Presence will not appear on Event Explorer'}</p>
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

                      {advancedSettingsSection}

                      {renderProgress()}

                      {createdContractAddress && (
                        <div className="border-2 border-black divide-black shadow rounded-2xl overflow-hidden bg-lila-100 p-4">
                          <p className="text-sm font-medium text-black">Event Created Successfully!</p>
                          <p className="text-xs break-all mt-1">
                            Share this link with your attendees: <Link href={`/mint-presence/#id=${createdContractAddress}`}>{createdContractAddress}</Link>
                          </p>
                        </div>
                      )}

                      <div className="mt-8">
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
        <StorageFeesInfo 
          isOpen={isStorageFeesInfoOpen}
          onClose={() => setIsStorageFeesInfoOpen(false)}
        />
        <PoapFeesInfo 
          isOpen={isPoapFeesInfoOpen}
          onClose={() => setIsPoapFeesInfoOpen(false)}
        />
        <TokenIdInfo 
          isOpen={isTokenIdInfoOpen}
          onClose={() => setIsTokenIdInfoOpen(false)}
        />
        <PresencePriceInfo 
          isOpen={isPresencePriceInfoOpen}
          onClose={() => setIsPresencePriceInfoOpen(false)}
        />
        <BurnableInfo 
          isOpen={isBurnableInfoOpen}
          onClose={() => setIsBurnableInfoOpen(false)}
        />
      </section>
    </>
  );
}