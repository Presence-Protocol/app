import { DUST_AMOUNT, waitForTxConfirmation, web3 } from '@alephium/web3'
import { PoapCollection } from '../artifacts/ts'
import { PrivateKeyWallet } from '@alephium/web3-wallet'



async function withdraw() {
  web3.setCurrentNodeProvider('https://node.mainnet.alephium.org', undefined, fetch)

  const signer = new PrivateKeyWallet({
    privateKey: process.env.PRIV_KEY ?? '',
    keyType: undefined,
    nodeProvider: web3.getCurrentNodeProvider(),
  });

  const collectionAddress = process.env.COLLECTION_ADDRESS
  if(!collectionAddress){
    console.error("Missing Collection contract address, use `COLLECTION_ADDRESS=xyz yarn run withdraw`")
    process.exit(1)
  }

  const collection = PoapCollection.at(collectionAddress)
  
  const collectionBalance =  await web3.getCurrentNodeProvider().addresses.getAddressesAddressBalance(collectionAddress)
  console.log(`Collection balance: ${collectionBalance.balanceHint}`)

  const collectionState = await collection.fetchState()
  const amountToWithdraw = BigInt(collectionState.fields.amountAirdrop)

  if(amountToWithdraw > 0) {
    const tx = await collection.transact.withdrawAirdrop({
      args: {
        amount: BigInt(amountToWithdraw)
    },
    signer: signer,
    attoAlphAmount: DUST_AMOUNT
  })
    console.log(`Withdrawing ${amountToWithdraw} from ${collectionAddress}, txId: ${tx.txId}`)
    await waitForTxConfirmation(tx.txId, 1, 3000)
  } else {
    console.log('No amount to withdraw')
  }

}


withdraw()