import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { NULL_CONTRACT_ADDRESS, stringToHex, web3 } from '@alephium/web3'
import { PoapCollection, PoapNFT } from '../artifacts/ts'
import { PrivateKeyWallet } from '@alephium/web3-wallet'


const deployTemplates: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  PrivateKeyWallet.Random(0, web3.getCurrentNodeProvider())

  await deployer.deployContract(PoapNFT,{
    initialFields: {
      collectionId: '00',
      nftIndex: 0n,
      imageUri: '00',
      eventName: '00',
      description: '00',
      organizer: NULL_CONTRACT_ADDRESS,
      location: '00',
      eventStartAt: 0n,
      eventEndAt: 0n,
      image: '00'
    }
  })

  await deployer.deployContract(PoapCollection,{
    initialFields: {
      nftTemplateId: '00',
      imageUri: '00',
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
      imageSvg: '00'
    }
  })


}

export default deployTemplates
