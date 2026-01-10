import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { Settings } from '../alephium.config'
import { stringToHex } from '@alephium/web3'
import { PoapFactory, PoapFactoryV2, PoapNFT } from '../artifacts/ts'


const deployFaucet: DeployFunction<Settings> = async (
  deployer: Deployer,
  network: Network<Settings>
): Promise<void> => {
  
  const poapNftTemplateId = deployer.getDeployContractResult('PoapNFTV2')
  const poapCollectionTemplateId = deployer.getDeployContractResult('PoapCollectionV2')

  const poapSerieNftTemplateId = deployer.getDeployContractResult('PoapNFTSerieV2')
  const poapCollectionSerieTemplateId = deployer.getDeployContractResult('PoapSerieCollectionV2')
  const poapDataTemplateId = deployer.getDeployContractResult('PoapData')

  await deployer.deployContract(PoapFactoryV2,{
    initialFields: {
      collectionTemplateId: poapCollectionTemplateId.contractInstance.contractId,
      poapTemplateId: poapNftTemplateId.contractInstance.contractId,
      numMintedCollection: 0n,
      collectionTemplateSeriesId: poapCollectionSerieTemplateId.contractInstance.contractId ,
      poapTemplateSeriesId: poapSerieNftTemplateId.contractInstance.contractId,
      poapTemplateDataId: poapDataTemplateId.contractInstance.contractId,
    }
  })
}


export default deployFaucet
