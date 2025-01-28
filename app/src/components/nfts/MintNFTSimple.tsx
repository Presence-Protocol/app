"use client"

import { addressFromContractId, contractIdFromAddress, DUST_AMOUNT, hexToString, MINIMAL_CONTRACT_DEPOSIT, stringToHex, web3 } from '@alephium/web3';
import { useWallet } from '@alephium/web3-react';
import { PoapFactory, PoapCollection } from 'my-contracts';
import { loadDeployments } from 'my-contracts/deployments';
import React, { useState } from 'react';

interface NFTCollection {
  title: string;
  description: string;
  image: string;
  price: number;
  maxSupply: bigint;
  currentSupply: bigint;
}

export default function MintNFTSimple() {
  const [quantity, setQuantity] = useState(1);

  const { account, signer } = useWallet()
  const [nftCollection, setNftCollection] = useState<NFTCollection>({
    title: '',
    description: '',
    image: '',
    price: 0.1,
    maxSupply: BigInt(0),
    currentSupply: BigInt(0)
  });

  web3.setCurrentNodeProvider(
    process.env.NEXT_PUBLIC_NODE_URL ?? "https://node.testnet.alephium.org",
    undefined,
    undefined
  ); // this can be set globally in the app

  const deployment = loadDeployments('testnet'); // TODO use getNetwork()
  const factoryContract = PoapFactory.at(deployment.contracts.PoapFactory.contractInstance.address);

  const poapCollection = PoapCollection.at("xV21hHQZsJaaf3KGgE11ukLkayYcztEmCG2n1m58eDom") // TODO contract id/address is passed as an URL parameter we have to use addressFromContractId() because it will be the contract id to will be passed on the URL
  
  poapCollection.fetchState().then((collectionMetadata) => {
    setNftCollection({ 
      title: hexToString(collectionMetadata.fields.eventName),
      description: hexToString(collectionMetadata.fields.description),
      image: hexToString(collectionMetadata.fields.imageSvg),
      price: 0.1,
      maxSupply: collectionMetadata.fields.maxSupply,
      currentSupply: collectionMetadata.fields.totalSupply
    })
  });
  // Mock data - in real app would come from props or API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signer) {
      throw new Error('Signer not available')
    }

    factoryContract.transact.mintPoap({
      args: {
        collection: poapCollection.contractId,
      },
      signer: signer,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })
  }

  return (
    <section>
      <div className="mx-auto bg-lila-200">
        <div className="relative justify-center max-h-[calc(100vh-82px)] overflow-hidden px-4 h-screen">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-full max-w-lg p-8 text-center">
              <div className="w-64 h-64 mx-auto rounded-2xl border-2 border-black shadow bg-white">
                <img 
                  src={nftCollection.image} 
                  alt={nftCollection.title} 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <h3 className="mt-6 text-2xl font-medium text-black">{nftCollection.title}</h3>
              <p className="mt-2 text-sm text-black">{nftCollection.description}</p>
              <div className="mt-4 flex justify-center gap-4">
                <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-6 bg-lila-300 border-lila-600 border-2 py-3 rounded-lg h-8 tracking-wide">
                  {nftCollection.currentSupply} / {nftCollection.maxSupply}
                </div>
                <div className="text-black items-center shadow shadow-lila-600 text-xs font-semibold inline-flex px-6 bg-lila-300 border-lila-600 border-2 py-3 rounded-lg h-8 tracking-wide">
                  {nftCollection.price} ALPH
                </div>
              </div>

              <div className="mt-12">
                <button
                  onClick={handleSubmit}
                  type="button"
                  aria-label="mint"
                  className="text-black items-center shadow shadow-black text-lg font-semibold inline-flex px-6 focus:outline-none justify-center text-center bg-white border-black ease-in-out transform transition-all focus:ring-lila-700 focus:shadow-none border-2 duration-100 focus:bg-black focus:text-white py-3 rounded-lg h-16 tracking-wide focus:translate-y-1 w-full hover:text-lila-800"
                >
                  Mint NFT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
