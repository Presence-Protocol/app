import { DUST_AMOUNT, ExecuteScriptResult, SignerProvider } from '@alephium/web3'
import { Withdraw } from 'my-contracts'

export const withdrawToken = async (signerProvider: SignerProvider, amount: string, tokenId: string): Promise<ExecuteScriptResult> => {
  return await Withdraw.execute(signerProvider, {
    initialFields: {
      token: tokenId,
      amount: BigInt(amount)
    },
    attoAlphAmount: DUST_AMOUNT,
  })
}
