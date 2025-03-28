import { Address, DUST_AMOUNT, MINIMAL_CONTRACT_DEPOSIT, ONE_ALPH, stringToHex, subContractId, Token, waitForTxConfirmation, web3 } from "@alephium/web3";
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

export async function transferTokenTo(to: Address, tokenId: string ,amount: bigint) {
    const tx = await defaultSigner.signAndSubmitTransferTx({
        signerAddress: defaultSigner.address,
        destinations: [{ address: to, attoAlphAmount: DUST_AMOUNT, tokens: [{
            id: tokenId,
            amount: amount
        }] }]
    })
    return waitForTxConfirmation(tx.txId, 1, 1000)
}

export function getCollectionPath(parentContractId: string, mintedId: bigint) {
    return subContractId(parentContractId, mintedId.toString(16).padStart(64,'0'), 0)
  }

  export async function loadSvg(url: string): Promise<string> {
    const response = await fetch(url)
    return (await response.text()).replace(/[\r\n]/g, '')

  }
  
  export const balanceOf = async (address: string, tokenId: string): Promise<Token> => {
    const balances = await web3.getCurrentNodeProvider().addresses.getAddressesAddressBalance(address)
    const tokenBalances = balances.tokenBalances
    return tokenBalances === undefined
      ? { id: '', amount: 0n }
      : tokenBalances.find((t) => t.id === tokenId) ?? { id: '', amount: 0n }
  }

  export const alphBalanceOf = async (address: string): Promise<bigint> => {
    const balances = await web3.getCurrentNodeProvider().addresses.getAddressesAddressBalance(address)
    const balance = balances.balance
    return balance === undefined ? 0n : BigInt(balance)
  }