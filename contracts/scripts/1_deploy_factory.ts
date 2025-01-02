import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { stringToHex } from '@alephium/web3'
import { PoapFactory, PoapNFT } from '../artifacts/ts'


const deployFaucet: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  
  const poapNftTemplateId = deployer.getDeployContractResult('PoapNFT')
  const poapCollectionTemplateId = deployer.getDeployContractResult('PoapCollection')

  await deployer.deployContract(PoapFactory,{
    initialFields: {
      collectionTemplateId: poapCollectionTemplateId.contractInstance.contractId,
      poapTemplateId: poapNftTemplateId.contractInstance.contractId,
      numMintedCollection: 0n
    }
  })
}

export default deployFaucet
