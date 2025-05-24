"use client"

import { addressFromContractId, ALPH_TOKEN_ID, contractIdFromAddress, DUST_AMOUNT, hexToString, MINIMAL_CONTRACT_DEPOSIT, NetworkId, number256ToNumber, stringToHex, waitForTxConfirmation, web3, hashMessage } from '@alephium/web3';
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
import PaidPoapPriceInfo from '../Modals/PaidPoapPriceInfo';
import { AlephiumConnectButton } from '@alephium/web3-react'
import keccak256 from 'keccak256';


interface NFTCollection {
  title: string;
  description: string;
  image: string | null;
  mediaType?: 'image' | 'video';
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
  hashedPassword: string;
  organizer: string;
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
  // console.log(fullValue);
  return fullValue;
};

// Move this outside the component render function to prevent re-creation on each render
const ConnectButton = () => (
  <AlephiumConnectButton.Custom>
    {({ show }) => (
      <button
        onClick={show}
        className="text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 py-3 rounded-2xl h-16 tracking-wide focus:translate-y-1 w-full hover:text-lila-800"
      >
        Connect Wallet
      </button>
    )}
  </AlephiumConnectButton.Custom>
);

// Add this helper function near the top of the component
const isVideoMedia = (src: string | null | undefined) => {
  if (!src) return false;
  const lower = src.toLowerCase();
  return (
    lower.startsWith('blob:') ||
    lower.startsWith('data:video') ||
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.ogg') ||
    lower.includes('video/mp4') ||
    lower.includes('video/webm') ||
    lower.includes('video/ogg')
  );
};

const getMediaType = async (url: string): Promise<'video' | 'image'> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    if (contentType?.startsWith('video/')) {
      return 'video';
    }
    // If content-type header is missing or not video, check the URL
    return isVideoMedia(response.url) ? 'video' : 'image';
  } catch (error) {
    console.error('Error checking media type:', error);
    // Fallback to checking the original URL
    return isVideoMedia(url) ? 'video' : 'image';
  }
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
    hashedPassword: stringToHex(''),
    organizer: '',
  });
  const [tokenList, setTokenList] = useState<any[]>([]);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [customPriceError, setCustomPriceError] = useState<string | null>(null);
  const [isPaidPoapPriceInfoOpen, setIsPaidPoapPriceInfoOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const mintEventsRef = useRef<HTMLDivElement | null>(null);

  const scrollToMintEvents = () => {
    if (mintEventsRef.current) {
      mintEventsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add a stable connection state that doesn't change frequently
  const [isConnected, setIsConnected] = useState(false);
  
  // Update the connection state only when it actually changes
  useEffect(() => {
    setIsConnected(connectionStatus === 'connected');
  }, [connectionStatus]);

  useEffect(() => {

    // Setup web3
    console.log('reloading poapCollection', poapCollection)


    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const idMatch = hash.match(/id=([^&]*)/);
      const id = idMatch ? idMatch[1] : null;
      setContractId(id);
    }
  }, []);

  useEffect(() => {
    console.log('reloading poapCollection', poapCollection)

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
    web3.setCurrentNodeProvider(
      process.env.NEXT_PUBLIC_NODE_URL ?? "https://node.testnet.alephium.org",
      undefined,
      undefined
    );
    const deployment = loadDeployments(process.env.NEXT_PUBLIC_NETWORK as NetworkId ?? 'testnet');
    if (!deployment.contracts.PoapFactory) {
      throw new Error('PoapFactory contract not found in deployments');
    }
    setFactoryContract(PoapFactory.at(deployment.contracts.PoapFactory.contractInstance.address));


    if (contractId) {
      const collectionAddress = contractId;
      setIsLoading(true);
      setError(null);

      const collection = PoapCollection.at(collectionAddress);
      setPoapCollection(collection);

      collection.fetchState()
        .then(async (collectionMetadata) => {
          const imageData = hexToString(collectionMetadata.fields.eventImage);
          console.log('Raw hex data length:', imageData?.length);
          console.log('Raw hex data start:', imageData?.substring(0, 50));
          
          // Validate and process the data
          let processedImageData = imageData;
          let isVideo = false;
          
          if (!imageData) {
            console.log('No image data found');
          } else {
            // Check if it's a valid data URL
            const isValidDataUrl = imageData.startsWith('data:');
            console.log('Is valid data URL:', isValidDataUrl);
            
            if (isValidDataUrl) {
              // Check if it's a video
              if (imageData.includes('video/mp4')) {
                isVideo = true;
                console.log('Detected video data URL');
                
                // Ensure proper base64 format
                if (!imageData.includes('base64,')) {
                  const base64Data = imageData.split(',')[1] || imageData;
                  processedImageData = `data:video/mp4;base64,${base64Data}`;
                  console.log('Reformatted video data URL');
                }
              } else if (imageData.includes('image/')) {
                console.log('Detected image data URL');
                // Ensure proper base64 format for images too
                if (!imageData.includes('base64,')) {
                  const base64Data = imageData.split(',')[1] || imageData;
                  const mimeType = imageData.split(',')[0].split(':')[1] || 'image/png';
                  processedImageData = `data:${mimeType};base64,${base64Data}`;
                  console.log('Reformatted image data URL');
                }
              } else {
                console.log('Unknown data URL type:', imageData.split(',')[0]);
              }
            } else {
              // If it's not a data URL, try to detect the content type
              console.log('Not a data URL, attempting to detect content type');
              // Detect video by file extension or video mime in URL
              const lower = imageData.toLowerCase();
              if (
                lower.endsWith('.mp4') ||
                lower.endsWith('.webm') ||
                lower.endsWith('.ogg') ||
                lower.includes('video/mp4') ||
                lower.includes('video/webm') ||
                lower.includes('video/ogg') ||
                lower.match(/\.(mp4|webm|ogg)(\?|$)/)
              ) {
                isVideo = true;
                processedImageData = imageData;
                console.log('Detected video URL or file extension');
              } else if (imageData.startsWith('/9j/') || imageData.startsWith('iVBORw0KGgo')) {
                // Common image base64 patterns
                processedImageData = `data:image/jpeg;base64,${imageData}`;
                console.log('Detected and formatted as JPEG');
              } else if (imageData.startsWith('AAAAIGZ0eXBpc')) {
                // Common video base64 pattern
                isVideo = true;
                processedImageData = `data:video/mp4;base64,${imageData}`;
                console.log('Detected and formatted as MP4');
              } else {
                console.log('Could not detect content type, using as-is');
              }
            }
          }
          
          console.log('Final processed data type:', processedImageData?.substring(0, 50));
          console.log('Is video:', isVideo);
          
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
          
          // Check if password is required
          const hasPassword = collectionMetadata.fields.hashedPassword !== '00';
          setPasswordRequired(hasPassword);

          console.log('Detection result:', { processedImageData, isVideo, imageData });
          setNftCollection({
            title: hexToString(collectionMetadata.fields.eventName),
            description: hexToString(collectionMetadata.fields.description),
            image: processedImageData,
            mediaType: isVideo ? 'video' : 'image',
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
            hashedPassword: collectionMetadata.fields.hashedPassword,
            organizer: collectionMetadata.fields.organizer,
          });
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error in collection state fetch:', error);
          setError('Failed to load event details. Please try again later.');
          setIsLoading(false);
        });
    } else {
      // console.log('No contract ID provided');
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

  // Add a function to validate password
  const validatePassword = (input: string, hashedPassword: string) => {
    if (!input) {
      setPasswordError('Password is required');
      setIsPasswordValid(false);
      return false;
    }
    
    // Hash the input password with SHA-256
    const hashedInput = keccak256(input).toString('hex');
    
    // Compare with the stored hashed password
    if (hashedInput !== hashedPassword) {
      setPasswordError('Incorrect password');
      setIsPasswordValid(false);
      return false;
    }
    
    setPasswordError(null);
    setIsPasswordValid(true);
    return true;
  };

  // Update the password onChange handler
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    // Validate password on change
    if (passwordRequired && nftCollection.hashedPassword) {
      validatePassword(newPassword, nftCollection.hashedPassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password if required
    if (passwordRequired) {
      if (!validatePassword(password, nftCollection.hashedPassword)) {
        return;
      }
    }
    
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
          amount: nftCollection.isOpenPrice ? customPriceAmount : 0n,
          password: passwordRequired ? stringToHex(password) : '00',
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
      } else if (error.message?.includes('Assertion Failed in Contract') && error.message?.includes('Error Code: 7')) {
        // Add error handling for incorrect password (assuming error code 7 is used for password mismatch)
        setPasswordError('Incorrect password');
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


  useEffect(() => {
    console.log('connectionStatus', connectionStatus)
  }, [connectionStatus])

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
    console.log('reloading poapCollection', poapCollection)

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

  // Replace the MintButton component with this approach
  const renderButton = () => {
    if (!isConnected) {
      return <ConnectButton />;
    }

    const isDisabled = 
      isMinting ||
      Date.now() < Number(nftCollection.mintStartDate) ||
      Date.now() > Number(nftCollection.mintEndDate) ||
      nftCollection.currentSupply >= nftCollection.maxSupply ||
      (nftCollection.isOpenPrice && !customPrice) ||
      (passwordRequired && !isPasswordValid);
      
    const buttonClasses = `text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 py-3 rounded-2xl h-16 tracking-wide focus:translate-y-1 w-full hover:text-lila-800 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;

    let buttonContent;
    if (isMinting) {
      buttonContent = (
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
      );
    } else if (nftCollection.currentSupply >= nftCollection.maxSupply) {
      buttonContent = 'Max Supply Reached';
    } else if (Date.now() < Number(nftCollection.mintStartDate)) {
      buttonContent = `Minting starts ${formatDate(nftCollection.mintStartDate)}`;
    } else if (Date.now() > Number(nftCollection.mintEndDate)) {
      buttonContent = 'Minting Ended';
    } else if (passwordRequired && !isPasswordValid) {
      buttonContent = passwordError || 'Enter Valid Password to Mint';
    } else if (nftCollection.isOpenPrice && !customPrice) {
      buttonContent = 'Enter Price to Mint';
    } else {
      buttonContent = (
        <div className="flex items-center justify-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lila-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-lila-800"></span>
          </div>
          <span>Mint Presence</span>
        </div>
      );
    }

    return (
      <button
        onClick={handleSubmit}
        disabled={isDisabled}
        className={buttonClasses}
      >
        {buttonContent}
      </button>
    );
  };

  const [raffleWinnerCount, setRaffleWinnerCount] = useState(1);
  const [isRaffling, setIsRaffling] = useState(false);
  const [raffleWinners, setRaffleWinners] = useState<Array<{
    caller: string;
    nftIndex: bigint;
    timestamp: number;
  }>>([]);
  const [showWinners, setShowWinners] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  
  // Add ref for winners section
  const raffleWinnersRef = useRef<HTMLDivElement | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    });
  };

  const handleRaffleDraw = () => {
    setIsRaffling(true);
    
    try {
      if (!mintEvents.length) {
        throw new Error('No mint events available');
      }

      // Create a copy of events to randomly select from
      const eventsCopy = [...mintEvents];
      const winnerCount = Math.min(raffleWinnerCount, eventsCopy.length);
      const selectedWinners: Array<{
        caller: string;
        nftIndex: bigint;
        timestamp: number;
      }> = [];

      // Select random winners
      for (let i = 0; i < winnerCount; i++) {
        const randomIndex = Math.floor(Math.random() * eventsCopy.length);
        selectedWinners.push(eventsCopy[randomIndex]);
        // Remove selected winner to avoid duplicates
        eventsCopy.splice(randomIndex, 1);
      }

      // Add a delay for animation effect
      setTimeout(() => {
        setRaffleWinners(selectedWinners);
        setShowWinners(true);
        setIsRaffling(false);
        
        // Scroll to winners section after a brief delay to ensure it's rendered
        setTimeout(() => {
          if (raffleWinnersRef.current) {
            raffleWinnersRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }, 1500);
      
    } catch (error) {
      console.error('Error handling raffle:', error);
      setIsRaffling(false);
    }
  };

  // Add a function to check if the current user is the organizer
  const isUserOrganizer = () => {
    if (!account || !nftCollection.organizer) return false;
    return account.address === nftCollection.organizer;
  };

  // Add this state to track media types
  const [mediaTypes, setMediaTypes] = useState<Record<string, 'video' | 'image'>>({});

  // Add this effect to check media types when image changes
  useEffect(() => {
    const checkMediaType = async () => {
      if (nftCollection.image && !nftCollection.image.startsWith('data:')) {
        try {
          const mediaType = await getMediaType(nftCollection.image);
          setMediaTypes(prev => ({
            ...prev,
            [nftCollection.image!]: mediaType
          }));
        } catch (error) {
          console.error('Error determining media type:', error);
        }
      }
    };
    
    checkMediaType();
  }, [nftCollection.image]);

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
                      (mediaTypes[nftCollection.image] === 'video' || isVideoMedia(nftCollection.image)) ? (
                        <video 
                          key={nftCollection.image}
                          src={nftCollection.image}
                          className="w-full h-full object-cover rounded-xl"
                          loop={true}
                          autoPlay={true}
                          muted
                          playsInline
                          onError={(e) => {
                            const target = e.target as HTMLVideoElement;
                            console.error('Video loading error:', {
                              error: e,
                              src: nftCollection.image?.substring(0, 100),
                              element: target,
                              mediaType: mediaTypes[nftCollection.image!]
                            });
                            target.style.display = 'none';
                            target.parentElement?.classList.add('bg-gradient-to-br', 'from-lila-100', 'to-lila-300');
                          }}
                          onLoadedData={(e) => {
                            console.log('Video loaded successfully:', {
                              src: nftCollection.image?.substring(0, 50),
                              mediaType: mediaTypes[nftCollection.image!]
                            });
                            const target = e.target as HTMLVideoElement;
                            target.style.display = 'block';
                          }}
                        />
                      ) : (
                        <img
                          src={nftCollection.image}
                          alt={nftCollection.title}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            console.error('Image loading error:', {
                              error: e,
                              src: nftCollection.image?.substring(0, 100),
                              element: target,
                              mediaType: mediaTypes[nftCollection.image!]
                            });
                            target.style.display = 'none';
                            target.parentElement?.classList.add('bg-gradient-to-br', 'from-lila-100', 'to-lila-300');
                          }}
                          onLoad={(e) => {
                            console.log('Image loaded successfully:', {
                              src: nftCollection.image?.substring(0, 50),
                              mediaType: mediaTypes[nftCollection.image!]
                            });
                          }}
                        />
                      )
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
                          <span className="text-gray-600">
                            {(() => {
                              // Check if location is a URL
                              const isUrl = (str: string): boolean => {
                                // Check for common URL patterns
                                return (
                                  str.startsWith('http://') || 
                                  str.startsWith('https://') || 
                                  str.startsWith('www.') ||
                                  /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/.test(str) // domain pattern
                                );
                              };
                              
                              // Format URL properly
                              const formatUrl = (url: string): string => {
                                if (url.startsWith('http://') || url.startsWith('https://')) {
                                  return url;
                                } else if (url.startsWith('www.')) {
                                  return `https://${url}`;
                                } else {
                                  return `https://${url}`;
                                }
                              };
                              
                              if (isUrl(nftCollection.location)) {
                                return (
                                  <a 
                                    href={formatUrl(nftCollection.location)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="underline hover:text-lila-800"
                                  >
                                    {nftCollection.location}
                                  </a>
                                );
                              } else {
                                return nftCollection.location;
                              }
                            })()}
                          </span>
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

                  <div className="mt-10 max-w-md mx-auto">
                    {/* Add password input when password is required */}
                    {passwordRequired && (
                      <div className="mb-6">
                        <div className="relative">
                          <input
                            type="password"
                            placeholder="Event Password"
                            value={password}
                            onChange={handlePasswordChange}
                            className={`block w-full px-3 py-3 text-xl text-black border-2 ${
                              passwordError ? 'border-red-500' : isPasswordValid ? 'border-green-500' : 'border-black'
                            } shadow appearance-none placeholder-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm rounded-2xl`}
                          />
                        </div>
                        {passwordError && (
                          <p className="mt-1 text-sm text-red-600 text-left">{passwordError}</p>
                        )}
                      </div>
                    )}

                    {/* Add custom price input when isOpenPrice is true */}
                    {nftCollection.isOpenPrice && (
                      <div className="mb-6">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="Set your own price"
                            value={customPrice}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              
                              if (!/^[0-9]*\.?[0-9]*$/.test(inputValue) && inputValue !== '') {
                                return;
                              }
                              
                              setCustomPrice(inputValue);
                              setCustomPriceError(null);
                            }}
                            className="block w-full px-3 py-3 text-xl text-black border-2 border-black shadow appearance-none placeholder-black focus:border-black focus:bg-lila-500 focus:outline-none focus:ring-black sm:text-sm rounded-2xl"
                          />
                          <div className="absolute right-12 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                            {nftCollection.tokenNamePaidPoap || 'ALPH'}
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsPaidPoapPriceInfoOpen(true)}
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
                        {customPriceError && (
                          <p className="mt-1 text-sm text-red-600 text-left">{customPriceError}</p>
                        )}
                      </div>
                    )}

                    <div className="mt-8">
                      {renderButton()}
                    </div>

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
          <div ref={mintEventsRef} className="p-8 pt-12 pb-4 max-w-3xl mx-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medium leading-6 text-black text-left flex items-center justify-left gap-2">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lila-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-lila-800"></span>
                </div>
                Recent Mints
              </h3>
              
              {/* Raffle Controls - Only visible to organizer */}
              {isUserOrganizer() && (
                <div className="flex items-center gap-2">
                  number of winners: <input
                    type="number"
                    min="1"
                    max={mintEvents.length}
                    value={raffleWinnerCount}
                    onChange={(e) => setRaffleWinnerCount(Math.min(Math.max(1, parseInt(e.target.value) || 1), mintEvents.length))}
                    className="w-12 h-8 px-2 text-sm bg-white border-2 border-black rounded-lg text-center"
                  />
                  <button
                    onClick={handleRaffleDraw}
                    disabled={isRaffling}
                    className="h-8 bg-lila-500 text-black text-sm font-medium px-3 py-1 rounded-lg border-2 border-black flex items-center gap-1"
                  >
                    {isRaffling ? "Drawing..." : "Raffle Draw"}
                  </button>
                </div>
              )}
            </div>
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

        {/* Winners Display */}
        {showWinners && raffleWinners.length > 0 && (
          <div ref={raffleWinnersRef} className="p-8 pt-4 pb-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lila-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-lila-800"></span>
                </div>
                <h3 className="text-xl font-medium text-black">Raffle Winners</h3>
              </div>
              <button 
                onClick={() => setShowWinners(false)}
                className="text-sm text-black hover:underline"
              >
                Hide
              </button>
            </div>
            
            <div className="mt-4 border-2 border-black rounded-2xl overflow-hidden">
              {raffleWinners.map((winner, index) => (
                <div key={index} className="flex items-center justify-between p-5 bg-lila-300 border-b border-black last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-lila-400 text-black font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <span 
                        className="block text-black font-mono font-medium text-sm flex items-center gap-2 cursor-pointer group"
                        onClick={() => copyToClipboard(winner.caller)}
                      >
                        {`${winner.caller.slice(0, 6)}...${winner.caller.slice(-4)}`}
                        <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          {copiedAddress === winner.caller ? (
                            <span className="text-green-600">Copied!</span>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </span>
                      </span>
                      <span className="text-xs text-gray-600">
                        Mint #{number256ToNumber(winner.nftIndex, 0)}
                      </span>
                    </div>
                  </div>
                  <div className="text-black text-sm">
                    {new Date(winner.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
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
      <PaidPoapPriceInfo 
        isOpen={isPaidPoapPriceInfoOpen}
        onClose={() => setIsPaidPoapPriceInfoOpen(false)}
        tokenName={nftCollection.tokenNamePaidPoap || 'ALPH'}
      />
    </section>
  );
}
