import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { ALPH_TOKEN_ID, NULL_CONTRACT_ADDRESS, stringToHex, web3, ZERO_ADDRESS } from '@alephium/web3'
import { PoapCollection, PoapCollectionV2, PoapNFT } from '../artifacts/ts'
import { PrivateKeyWallet } from '@alephium/web3-wallet'


const deployTemplates: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  PrivateKeyWallet.Random(0, web3.getCurrentNodeProvider())

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


}

export default deployTemplates
