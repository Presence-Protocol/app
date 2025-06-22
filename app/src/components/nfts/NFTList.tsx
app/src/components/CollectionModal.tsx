"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlephiumConnectButton, useWallet } from '@alephium/web3-react'
import { useWalletLoading } from '@/context/WalletLoadingContext';
import Image from 'next/image';
import { addressFromContractId, DUST_AMOUNT, hexToString, number256ToNumber, ONE_ALPH, waitForTxConfirmation, web3 } from '@alephium/web3';
import { PoapCollection, PoapNFT } from 'my-contracts';
import Snackbar from '../ui/Snackbar';
import { findTokenFromId, getTokenList, Token } from '@/services/utils';
import { truncateAddress } from '@/utils/stringUtils';
import CollectionModal, { Collection, NFTMetadata } from './CollectionModal';

interface POAPResponse {
  contractId: string;
  collectionContractId: string;
// ... existing code ...
  eventDateEnd?: string;
  amountPaidPoap?: bigint;
  pricePoap?: bigint;
  isOpenPrice?: boolean;
  tokenSymbol?: string;
  tokenMetadata?: Token;
}

// Helper function to humanize amounts with K, M, B suffixes for large numbers
const humanizeAmount = (amount: bigint, decimals: number = 18): string => {
  // Convert bigint to a decimal number with proper decimal places
// ... existing code ...
        </div>


      </div>
      <CollectionModal 
        isOpen={!!selectedCollection}
        onClose={handleClosePanel}
        collection={selectedCollection}
        isAnimatingOut={isAnimatingOut}
        handleShare={handleShare}
      />
      <Snackbar 
        message={claimMessage} 
        isOpen={isSnackbarOpen} 
// ... existing code ...
        <div className="flex-1 flex flex-col overflow-hidden p-8 pt-0">
          <div className="flex overflow-x-auto space-x-6 pb-4 -mx-8 px-8" style={{ scrollbarWidth: 'none' }}>
            {collection.nfts.map((nft) => (
              <div key={nft.tokenId} className="flex-shrink-0 w-80">
                <div className="border-2 border-black rounded-xl overflow-hidden bg-white shadow h-full flex flex-col">
// ... existing code ...
                  <div className="p-4 pb-5 bg-white flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-black mb-1">{nft.title}</h3>
// ... existing code ...
                    <div className="flex justify-between items-center pt-3 border-t-2 border-black">
                      <div className="text-black items-center shadow shadow-lila-600 text-[10px] font-semibold inline-flex px-2 bg-lila-300 border-lila-600 border-2 py-1 rounded-lg tracking-wide">
                        {nft.tokenId}
                      </div>
                      <div className="text-xs text-black font-medium">
// ... existing code ...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
// ... existing code ...

</rewritten_file> 