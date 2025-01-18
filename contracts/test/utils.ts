import { Address, ONE_ALPH, stringToHex, subContractId, waitForTxConfirmation } from "@alephium/web3";
import { testPrivateKey } from "@alephium/web3-test";
import { PrivateKeyWallet } from "@alephium/web3-wallet";


export const DEFAULT_ALPH_AMOUNT_RANDOM_SIGNER = 100n * ONE_ALPH


export const defaultSigner = new PrivateKeyWallet({
    privateKey: testPrivateKey
})
export async function getRandomSigner(group?: number): Promise<PrivateKeyWallet> {
    const pkWallet = PrivateKeyWallet.Random(group)
    await transferAlphTo(pkWallet.address, DEFAULT_ALPH_AMOUNT_RANDOM_SIGNER)
    return pkWallet
}

export async function transferAlphTo(to: Address, amount: bigint) {
    const tx = await defaultSigner.signAndSubmitTransferTx({
        signerAddress: defaultSigner.address,
        destinations: [{ address: to, attoAlphAmount: amount }]
    })
    return waitForTxConfirmation(tx.txId, 1, 1000)
}

export function getCollectionPath(parentContractId: string, mintedId: bigint) {
    return subContractId(parentContractId, mintedId.toString(16).padStart(64,'0'), 0)
  }
