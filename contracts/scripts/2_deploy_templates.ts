import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { ALPH_TOKEN_ID, NULL_CONTRACT_ADDRESS, stringToHex, web3, ZERO_ADDRESS } from '@alephium/web3'
import { PoapCollection, PoapCollectionV2, PoapData, PoapNFT, PoapNFTSerieV2, PoapNFTV2, PoapSerieCollectionV2 } from '../artifacts/ts'
import { PrivateKeyWallet } from '@alephium/web3-wallet'


const deployTemplates: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  PrivateKeyWallet.Random(0, web3.getCurrentNodeProvider())

  await deployer.deployContract(PoapNFTV2,{
    initialFields: {
      collectionId: '00',
      nftIndex: 0n,
      eventImage: '00',
      eventName: '00',
      description: '00',
      organizer: NULL_CONTRACT_ADDRESS,
      location: '00',
      eventStartAt: 0n,
      eventEndAt: 0n,
      isPublic: false,
      minter: NULL_CONTRACT_ADDRESS,
      isBurnable: false,
      hasParticipated: false,
      lockedUntil: 0n
    }
  })

  await deployer.deployContract(PoapCollectionV2,{
    initialFields: {
      nftTemplateId: '00',
      eventImage: '00',
      maxSupply: 0n,
      mintStartAt: 0n,
      mintEndAt: 0n,
      eventName: '00',
      description: '00',
      organizer: NULL_CONTRACT_ADDRESS,
      location: '00',
      eventStartAt: 0n,
      eventEndAt: 0n,
      totalSupply: 0n,
      isPublic: false,
      oneMintPerAddress: false,
      isBurnable: false,
      amountForStorageFees: 0n,
      poapPrice: 0n,
      tokenIdPoap: ALPH_TOKEN_ID,
      amountPoapFees: 0n,
      tokenIdAirdrop: '',
      amountAirdropPerUser: 0n,
      amountAirdrop: 0n,
      airdropWhenHasParticipated: false,
      amountForChainFees: 0n,
      isOpenPrice: false,
      hashedPassword: '00',
      lockPresenceUntil: 0n
    }
  })

  await deployer.deployContract(PoapData,{
    initialFields: {
      collectionId: '00',
      maxSupply: 0n,
      mintStartAt: 0n,
      mintEndAt: 0n,
      poapPrice: 0n,
      tokenIdPoap: '00',
      isOpenPrice: false,
      tokenIdAirdrop: '00',
      amountAirdropPerUser: 0n,
      airdropWhenHasParticipated: false,
      eventImage: '00',
      eventName: '00',
      description: '00',
      organizer: NULL_CONTRACT_ADDRESS,
      location: '00',
      eventStartAt: 0n,
      eventEndAt: 0n,
      isPublic: false,
      isBurnable: false,
      lockedUntil: 0n,
      hashedPassword: '',
      totalSupply: 0n,
      amountForStorageFees: 0n,
      amountForChainFees: 0n,
      amountPoapFees: 0n,
      amountAirdrop: 0n
    }
  })


  await deployer.deployContract(PoapSerieCollectionV2,{
    initialFields: {
      nftTemplateId: '00',
      organizer: NULL_CONTRACT_ADDRESS,
      poapDataTemplateId: '00',
      isPublicCollection: false,
      collectionImage: '00',
      collectionName: '00',
      collectionDescription: '00',
      totalSupply: 0n,
      totalSupplySeries: 0n
    }
  })

  

  await deployer.deployContract(PoapNFTSerieV2,{
    initialFields: {
      collectionId: '00',
      nftIndex: 0n,
      eventImage: '00',
      eventName: '00',
      description:'00',
      organizer: NULL_CONTRACT_ADDRESS,
      location: '00',
      eventStartAt: 0n,
      eventEndAt: 0n,
      isPublic: false,
      minter: NULL_CONTRACT_ADDRESS,
      isBurnable: false,
      lockedUntil: 0n,
      oneMintPerAddress: false,
      hasParticipated: false
    }
  })


}

export default deployTemplates
