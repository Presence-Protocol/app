"use client"

import { addressFromContractId, ALPH_TOKEN_ID, contractIdFromAddress, DUST_AMOUNT, hexToString, MINIMAL_CONTRACT_DEPOSIT, NetworkId, number256ToNumber, stringToHex, waitForTxConfirmation, web3 } from '@alephium/web3';
import { useWallet } from '@alephium/web3-react';
import { PoapFactory, PoapCollection, PoapFactoryTypes, PoapFactoryInstance, PoapCollectionInstance } from 'my-contracts';
import { loadDeployments } from 'my-contracts/deployments';
import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import MintSuccessModal from '../Modals/MintSuccessModal';
import Confetti from 'react-confetti'
import useWindowSize from '@/hooks/useWindowSize'
import AlreadyMintedWarning from '../Modals/AlreadyMintedWarning';
import { getTokenList, findTokenFromId } from '@/services/utils';

interface NFTCollection {
  title: string;
  description: string;
  image: string | null;
  price: number;
  maxSupply: bigint;
  mintEndDate: bigint;
  mintStartDate: bigint;
  eventStartDate: bigint;
  eventEndDate: bigint;
  location: string;
  currentSupply: bigint;
  isPublic: boolean;
  amountForStorageFees: bigint;
  amountForChainFees: bigint;
  oneMintPerAddress: boolean;
  tokenIdPaidPoap: string;
  tokenPricePaidPoap: bigint;
  tokenNamePaidPoap?: string;
  tokenDecimalsPaidPoap?: number;
  isOpenPrice: boolean;
}


const parseTokenAmount = (input: string, decimals: number): bigint => {
  if (!input || input === '0') return 0n;
  
  const parts = input.split('.');
  const integerPart = parts[0] || '0';
  let fractionalPart = parts.length > 1 ? parts[1] : '';
  
  // Pad or truncate fractional part based on token decimals
  if (fractionalPart.length > decimals) {
    fractionalPart = fractionalPart.substring(0, decimals);
  } else {
    fractionalPart = fractionalPart.padEnd(decimals, '0');
  }
  
  // Combine integer and fractional parts
  const fullValue = BigInt(integerPart) * (10n ** BigInt(decimals)) + BigInt(fractionalPart);
  console.log(fullValue);
  return fullValue;
};

export default function MintNFTSimple() {
  const { connectionStatus } = useWallet();
  const [quantity, setQuantity] = useState(1);
  const [contractId, setContractId] = useState<string | null>(null);
  const [factoryContract, setFactoryContract] = useState<PoapFactoryInstance | null>(null);
  const [poapCollection, setPoapCollection] = useState<PoapCollectionInstance | null>(null);
  const { account, signer } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMintSuccessOpen, setIsMintSuccessOpen] = useState(false);
  const [mintTxId, setMintTxId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const [isAlreadyMintedOpen, setIsAlreadyMintedOpen] = useState(false);
  const [mintEvents, setMintEvents] = useState<Array<{
    caller: string;
    nftIndex: bigint;
    timestamp: number;
  }>>([]);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [nftCollection, setNftCollection] = useState<NFTCollection>({
    title: '00',
    description: '00',
    image: null,
    price: 0.1,
    maxSupply: BigInt(0),
    mintEndDate: BigInt(0),
    mintStartDate: BigInt(0),
    eventStartDate: BigInt(0),
    eventEndDate: BigInt(0),
    location: '00',
    currentSupply: BigInt(0),
    isPublic: false,
    amountForStorageFees: 0n,
    amountForChainFees: 0n,
    oneMintPerAddress: false,
    tokenIdPaidPoap: ALPH_TOKEN_ID,
    tokenPricePaidPoap: 0n,
    tokenNamePaidPoap: 'ALPH',  
    isOpenPrice: false,
  });
  const [tokenList, setTokenList] = useState<any[]>([]);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [customPriceError, setCustomPriceError] = useState<string | null>(null);

  const mintEventsRef = useRef<HTMLDivElement | null>(null);

  const scrollToMintEvents = () => {
    if (mintEventsRef.current) {
      mintEventsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // console.log('UseEffect running');
    // Setup web3


    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const idMatch = hash.match(/id=([^&]*)/);
      const id = idMatch ? idMatch[1] : null;
      setContractId(id);
    }
  }, []);

  useEffect(() => {
    const fetchTokenList = async () => {
      try {
        const tokens = await getTokenList();
        setTokenList(tokens);
      } catch (error) {
        console.error('Error fetching token list:', error);
      }
    };
    
    fetchTokenList();
  }, []);

  useEffect(() => {
    console.log('UseEffect running')
    web3.setCurrentNodeProvider(
      process.env.NEXT_PUBLIC_NODE_URL ?? "https://node.testnet.alephium.org",
      undefined,
      undefined
    );
    const deployment = loadDeployments(process.env.NEXT_PUBLIC_NETWORK as NetworkId ?? 'testnet');
    setFactoryContract(PoapFactory.at(deployment.contracts.PoapFactory.contractInstance.address));


    if (contractId) {
      const collectionAddress = contractId;
      setIsLoading(true);
      setError(null);

      const collection = PoapCollection.at(collectionAddress);
      setPoapCollection(collection);

      collection.fetchState()
        .then(async (collectionMetadata) => {
          console.log(collectionMetadata)
          
          // Get token name from token list
          let tokenName = 'ALPH';
          let token
          if (collectionMetadata.fields.tokenIdPoap !== ALPH_TOKEN_ID) {
            token = findTokenFromId(tokenList, collectionMetadata.fields.tokenIdPoap);
            if (token) {
              tokenName = token.symbol || token.name;
            } else {
              // Fallback to shortened ID if token not found in list
              tokenName = collectionMetadata.fields.tokenIdPoap.slice(0, 6) + '...';
            }
          }
          
          setNftCollection({
            title: hexToString(collectionMetadata.fields.eventName),
            description: hexToString(collectionMetadata.fields.description),
            image: hexToString(collectionMetadata.fields.eventImage),
            price:  collectionMetadata.fields.amountForStorageFees >= 10n**17n ? 0 : 0.1,
            maxSupply: collectionMetadata.fields.maxSupply,
            currentSupply: collectionMetadata.fields.totalSupply,
            isPublic: collectionMetadata.fields.isPublic,
            location: hexToString(collectionMetadata.fields.location),
            mintStartDate: collectionMetadata.fields.mintStartAt,
            mintEndDate: collectionMetadata.fields.mintEndAt,
            eventStartDate: collectionMetadata.fields.eventStartAt,
            eventEndDate: collectionMetadata.fields.eventEndAt,
            amountForStorageFees: collectionMetadata.fields.amountForStorageFees,
            amountForChainFees: collectionMetadata.fields.amountForChainFees,
            oneMintPerAddress: collectionMetadata.fields.oneMintPerAddress,
            tokenIdPaidPoap: collectionMetadata.fields.tokenIdPoap,
            tokenPricePaidPoap: collectionMetadata.fields.poapPrice,
            tokenNamePaidPoap: tokenName,
            tokenDecimalsPaidPoap: token?.decimals,
            isOpenPrice: collectionMetadata.fields.isOpenPrice,
          });
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching collection state:', error);
          setError('Failed to load event details. Please try again later.');
          setIsLoading(false);
        });
    } else {
      console.log('No contract ID provided');
      setError('No event ID provided');
      setIsLoading(false);
    }
  }, [contractId, tokenList]);

  const calculateFinalAmount = (chainFees: bigint, storageFees: bigint): bigint => {
    let amount = MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT;
    // Case 1: Chain fees set and storage fees >= minimum deposit
    if (chainFees > 0n && storageFees >= MINIMAL_CONTRACT_DEPOSIT) {
      amount = 0n;
    }

    // Case 2: Storage fees >= minimum deposit but no chain fees
    if (storageFees >= MINIMAL_CONTRACT_DEPOSIT && chainFees <= 0n) {
      amount = DUST_AMOUNT;
    }

    // Case 3: Storage fees present but below minimum
    if (chainFees > 0n && storageFees < MINIMAL_CONTRACT_DEPOSIT) {
      amount = MINIMAL_CONTRACT_DEPOSIT;
    }

    // For ALPH token, add the price to the ALPH amount
    if (nftCollection.tokenIdPaidPoap === ALPH_TOKEN_ID && nftCollection.isOpenPrice && customPrice) {
      try {
        const decimals = nftCollection.tokenDecimalsPaidPoap || 18;
        const customPriceBigInt = parseTokenAmount(customPrice, decimals);
        amount += customPriceBigInt;
      } catch (error) {
        console.error('Error converting custom price:', error);
        amount += nftCollection.tokenPricePaidPoap;
      }
    } else if (nftCollection.tokenIdPaidPoap === ALPH_TOKEN_ID) {
      amount += nftCollection.tokenPricePaidPoap;
    }

    return amount;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate custom price if open price is enabled
    if (nftCollection.isOpenPrice && nftCollection.tokenPricePaidPoap > 0n) {
      if (!customPrice || customPrice === '0') {
        setCustomPriceError('Please enter a valid amount');
        return;
      }
      
      try {
        const customPriceValue = parseFloat(customPrice);
        if (isNaN(customPriceValue) || customPriceValue <= 0) {
          setCustomPriceError('Please enter a valid amount');
          return;
        }
        setCustomPriceError(null);
      } catch (error) {
        setCustomPriceError('Please enter a valid amount');
        return;
      }
    }
    
    setIsMinting(true);

    const finalAttoAmount = calculateFinalAmount(
      nftCollection.amountForChainFees,
      nftCollection.amountForStorageFees
    );

    try {
      if (!signer) {
        throw new Error('Signer not available')
      }
      if (!factoryContract) {
        throw new Error('Factory contract not initialized')
      }
      if (!poapCollection) {
        throw new Error('POAP collection not initialized')
      }

      console.log('nftCollection.tokenIdPaidPoap', nftCollection.tokenIdPaidPoap)

      // Convert custom price to BigInt with proper decimals using parseTokenAmount
      let customPriceAmount = 0n;
      if (nftCollection.isOpenPrice && customPrice) {
        const decimals = nftCollection.tokenDecimalsPaidPoap || 18;
        customPriceAmount = parseTokenAmount(customPrice, decimals);
      }

      // Prepare tokens array for the transaction
      const tokens = [];
      
      // For non-ALPH tokens
      if (nftCollection.tokenIdPaidPoap !== ALPH_TOKEN_ID) {
        // If open price is enabled, use the custom price
        if (nftCollection.isOpenPrice && customPrice) {
          tokens.push({
            id: nftCollection.tokenIdPaidPoap,
            amount: customPriceAmount
          });
        } else {
          // Otherwise use the default price
          tokens.push({
            id: nftCollection.tokenIdPaidPoap,
            amount: nftCollection.tokenPricePaidPoap
          });
        }
      }

      const result = await factoryContract.transact.mintPoap({
        args: {
          collection: poapCollection.contractId,
          amount: nftCollection.isOpenPrice ? customPriceAmount : 0n
        },
        signer: signer,
        attoAlphAmount: finalAttoAmount,
        tokens: tokens
      });

      await waitForTxConfirmation(result.txId, 1, 5 * 1000);
      setShowConfetti(true)
      setIsMintSuccessOpen(true);
      setIsMinting(false);
    } catch (error: any) {
      console.error('Error minting Presence:', error);
      setIsMinting(false);

      // Check for already minted error
      if (error.message?.includes('Assertion Failed in Contract') && error.message?.includes('Error Code: 6')) {
        setIsAlreadyMintedOpen(true);
      } else {
        setError('Failed to mint Presence. Please try again later.');
      }
    }
  }

  // Add event subscription
  useEffect(() => {
    if (!poapCollection) return;

    let isSubscribed = true;
    const subscription = poapCollection.subscribePoapMintedEvent({
      pollingInterval: 5000,
      messageCallback: async (event) => {
        console.log('Minted event:', event);
        if (isSubscribed) {
          setMintEvents(prev => {
            const exists = prev.some(e =>
              e.caller === event.fields.caller &&
              e.nftIndex === event.fields.nftIndex
            );
            if (exists) return prev;

            return [...prev, {
              caller: event.fields.caller,
              nftIndex: event.fields.nftIndex,
              timestamp: Number(event.fields.timestamp)
            }];
          });
        }
        return Promise.resolve();
      },
      errorCallback: (error, subscription) => {
        console.error('Error from collection contract:', error);
        if (isSubscribed) {
          subscription.unsubscribe();
        }
        return Promise.resolve();
      }
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [poapCollection]);

  const formatDate = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Add useEffect to control confetti duration
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      let targetDate: number;

      if (now < Number(nftCollection.mintStartDate)) {
        targetDate = Number(nftCollection.mintStartDate);
      } else if (now < Number(nftCollection.mintEndDate)) {
        targetDate = Number(nftCollection.mintEndDate);
      } else {
        setCountdown(null);
        return;
      }

      const timeLeft = targetDate - now;
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    const intervalId = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call to set the countdown immediately

    return () => clearInterval(intervalId);
  }, [nftCollection.mintStartDate, nftCollection.mintEndDate]);

  return (
    <section className="bg-lila-200 pt-16 pb-16 sm:pt-0 sm:pb-0">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#E5D4FF', '#FFF3DA', '#FFD1DA', '#D0BFFF']} // lila color palette
          tweenDuration={3000}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }}
        />
      )}
      <div className="mx-auto bg-lila-200">
        <div className="relative justify-center overflow-hidden px-4 pb-8 ">
          <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-82px)]">
            <div className="w-full max-w-xl p-8 text-center">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin">
                    <Image
                      src="/images/blob5.svg"
                      alt="Loading..."
                      width={60}
                      height={60}
                      className="opacity-70"
                      priority
                    />
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-800 p-4 rounded-lg text-white border flex items-center justify-center gap-2  ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon size-6 icon-tabler icon-tabler-alert-triangle text-white mr-1"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"
                    ></path>
                    <path d="M12 9v4"></path>
                    <path
                      d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"
                    ></path>
                    <path d="M12 16h.01"></path>
                  </svg>{error}
                </div>
              ) : (
                <>
                  <div className="w-64 h-64 mx-auto rounded-2xl border-2 border-black shadow bg-white nft-image">
                    {nftCollection.image ? (
                      <img
                        src={nftCollection.image}
                        alt={nftCollection.title}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-lila-100 to-lila-300">
                        <h4 className="text-xl font-semibold text-black text-center mb-2">{nftCollection.title}</h4>
                        {nftCollection.eventStartDate && (
                          <p className="text-sm text-gray-600 text-center">
                            {formatDate(nftCollection.eventStartDate)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <h3 className="mt-6 text-2xl font-medium text-black">{nftCollection.title}</h3>
                  <p className="mt-2 text-sm text-black">{nftCollection.description}</p>
                  
                  {/* Add event date display */}
                  <p className="mt-2 text-sm font-medium text-gray-600">
                    {formatDate(nftCollection.eventStartDate)}
                    {nftCollection.eventEndDate > nftCollection.eventStartDate && 
                      ` - ${formatDate(nftCollection.eventEndDate)}`
                    }
                  </p>

                  <div className="mt-4 flex flex-col gap-4">
                    <div className="flex justify-center gap-4">
                      <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-4 bg-lila-300 border-lila-600 border-2 py-2 rounded-lg h-8 tracking-wide">
                        {nftCollection.currentSupply.toString()} / {nftCollection.maxSupply.toString()}
                      </div>
                      {nftCollection.oneMintPerAddress && (
                        <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-4 bg-lila-300 border-lila-600 border-2 py-2 rounded-lg h-8 tracking-wide">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                          </svg>
                          <span>1 Per Wallet</span>
                        </div>
                      )}
                      
                      {nftCollection.price > 0 && (
                        <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-6 bg-lila-300 border-lila-600 border-2 py-3 rounded-lg h-8 tracking-wide">
                          {nftCollection.price} ALPH
                        </div>
                      )}
                      {nftCollection.tokenPricePaidPoap > 0 && !nftCollection.isOpenPrice && (
                        <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-6 bg-lila-300 border-lila-600 border-2 py-3 rounded-lg h-8 tracking-wide">
                          {number256ToNumber(nftCollection.tokenPricePaidPoap, nftCollection.tokenDecimalsPaidPoap || 18)} {nftCollection.tokenNamePaidPoap || 'Token'}
                        </div>
                      )}
                      {nftCollection.isOpenPrice && (
                        <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-6 bg-lila-300 border-lila-600 border-2 py-3 rounded-lg h-8 tracking-wide">
                         Open Price in {nftCollection.tokenNamePaidPoap || 'Token'}
                        </div>
                      )}
                    </div>
                        
                    <div className="flex flex-col gap-2 min-w-72 mt-2">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{nftCollection.location}</span>
                          {nftCollection.location && <span className="text-gray-400 hidden sm:inline">•</span>}
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">
                              {formatDate(nftCollection.eventStartDate)}
                            </span>
                          </div>
                         
                        </div>


                        {/* <div className="flex items-center gap-2">
                          <span className="text-gray-400 hidden sm:inline">•</span>
                          <span className="text-gray-600">
                            {formatDate(nftCollection.eventStartDate)} - {formatDate(nftCollection.eventEndDate)}
                          </span>
                        </div> */}
                        <span className="text-gray-400 hidden sm:inline">•</span>

                        <span className="text-gray-600">
                            {nftCollection.isPublic ? 'Public Event' : 'Private Event'}
                          </span>
                          <span className="text-gray-400 hidden sm:inline">•</span>
                          <span className="text-gray-600">
                            {nftCollection.tokenPricePaidPoap > 0 || nftCollection.isOpenPrice ? 'Paid Presence' : ''}
                          </span>

                        {/* {countdown && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">
                              {Date.now() < Number(nftCollection.mintStartDate) ? 'Minting starts in:' : 'Minting ends in:'}
                            </span>
                            <span className="text-gray-600 font-mono font-semibold bg-lila-200" style={{ minWidth: '80px', textAlign: 'right' }}>
                              {countdown}
                            </span>
                          </div>
                        )} */}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    {/* Add custom price input when isOpenPrice is true */}
                    {nftCollection.isOpenPrice && (
                      <div className="mb-4">
                        <div className="relative">
                          <label htmlFor="customPrice" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                            Set your own price:
                          </label>
                          <input
                            type="text"
                            id="customPrice"
                            inputMode="decimal"
                            placeholder="Enter amount"
                            value={customPrice}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow valid decimal number patterns
                              if (!/^[0-9]*\.?[0-9]*$/.test(value) && value !== '') {
                                return;
                              }
                              setCustomPrice(value);
                              setCustomPriceError(null);
                            }}
                            className="block w-full px-3 py-3 text-xl text-black border-2 border-black appearance-none placeholder-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm rounded-2xl"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                            {nftCollection.tokenNamePaidPoap || 'ALPH'}
                          </div>
                        </div>
                        {customPriceError && (
                          <p className="mt-1 text-sm text-red-600 text-left">{customPriceError}</p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={handleSubmit}
                      type="button"
                      aria-label="mint"
                      disabled={isMinting ||
                        connectionStatus !== 'connected' ||
                        Date.now() < Number(nftCollection.mintStartDate) ||
                        Date.now() > Number(nftCollection.mintEndDate) ||
                        nftCollection.currentSupply >= nftCollection.maxSupply ||
                        (nftCollection.isOpenPrice && nftCollection.tokenPricePaidPoap > 0n && !customPrice)}
                      className="text-black items-center shadow shadow-black max-w-md text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white 
                      border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100   py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:text-lila-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isMinting ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin">
                            <Image
                              src="/images/blob5.svg"
                              alt="Minting..."
                              width={30}
                              height={30}
                              className="opacity-70"
                              priority
                            />
                          </div>
                          <span>Minting...</span>
                        </div>
                      ) : connectionStatus !== 'connected' ? (
                        'Connect Wallet'
                      ) : nftCollection.currentSupply >= nftCollection.maxSupply ? (
                        'Max Supply Reached'
                      ) : Date.now() < Number(nftCollection.mintStartDate) ? (
                        `Minting starts ${formatDate(nftCollection.mintStartDate)}`
                      ) : Date.now() > Number(nftCollection.mintEndDate) ? (
                        'Minting Ended'
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lila-600 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-lila-800"></span>
                          </div>
                          <span>Mint Presence</span>
                        </div>
                      )}
                    </button>

                    <div className="text-sm text-center">
                      <div className="text-gray-600">

                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-5 flex">
                      {/* <>Minting available until {formatDate(nftCollection.mintEndDate)}</> */}
                      {countdown && (
                        <div className="flex items-center gap-2 mx-auto">
                          <span className="text-gray-600">
                            {Date.now() < Number(nftCollection.mintStartDate) ? 'Minting starts in:' : 'Minting ends in:'}
                          </span>
                          <span className="text-gray-600 font-mono font-semibold bg-lila-200" style={{ minWidth: '80px', textAlign: 'right' }}>
                            {countdown}
                          </span>
                        </div>
                      )}
                    </div>


                    {
                      mintEvents.length > 0 ? (
                        <p
                          onClick={scrollToMintEvents}
                          className="mt-6 text-black text-sm font-semibold text-center cursor-pointer hover:text-lila-800"
                        >
                          View All Mints &darr;
                        </p>
                      )
                        :
                        null
                      // <p
                      //   onClick={scrollToMintEvents}
                      //   className="mt-6 text-black text-sm font-semibold text-center cursor-pointer"
                      // >
                      //   Be the <span className="font-bold italic">first</span> to mint this presence
                      // </p>

                    }
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mint Events Table */}
        {mintEvents.length > 0 && (
          <div ref={mintEventsRef} className="p-8 lg:p-20 max-w-3xl mx-auto">
            <h3 className="text-xl font-medium leading-6 text-black text-left flex items-center justify-left gap-2">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lila-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lila-800"></span>
              </div>
              Recent Mints
            </h3>
            <div className="mt-4 flow-root mx-auto">
              <div className="overflow-x-auto border-2 border-black rounded-2xl shadow">
                <div className="inline-block w-full align-middle rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y-2 divide-black w-full">
                    <thead className="bg-lila-500">
                      <tr>
                        <th scope="col" className="p-5 text-left text-base font-semibold text-black">
                          Minter Address
                        </th>
                        <th scope="col" className="p-5 text-right text-base font-semibold text-black">
                          Mint Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black">
                      {[...mintEvents]
                        .reverse()
                        .map((event, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-lila-200' : 'bg-white'}>
                            <td className="whitespace-nowrap p-5 text-base uppercase text-black">
                              <span className="block text-black font-mono font-medium">
                                {`${event.caller.slice(0, 6)}...${event.caller.slice(-4)}`}
                              </span>
                            </td>
                            <td className="whitespace-nowrap p-5 text-base text-black text-right">
                              {new Date(event.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <MintSuccessModal
        isOpen={isMintSuccessOpen}
        isMinting={isMinting}
        onClose={() => setIsMintSuccessOpen(false)}
        nftImage={nftCollection.image}
        nftTitle={nftCollection.title}
        eventDate={`${formatDate(nftCollection.eventStartDate)} - ${formatDate(nftCollection.eventEndDate)}`}
      />
      <AlreadyMintedWarning
        isOpen={isAlreadyMintedOpen}
        onClose={() => setIsAlreadyMintedOpen(false)}
      />
    </section>
  );
}
