import { NetworkId } from "@alephium/web3";
import { loadDeployments } from "my-contracts/deployments"

export interface TokenFaucetConfig {
  network: NetworkId
  groupIndex: number
  tokenFaucetAddress: string
  faucetTokenId: string
}

export interface TokenList {
  networkId: number
  tokens: Token[]
}

export interface Token {
  id: string
  name: string
  symbol: string
  decimals: number
  description: string
  logoURI: string
  nameOnChain?: string
  symbolOnChain?: string
}

export function getNetwork(): NetworkId {
  const network = (process.env.NEXT_PUBLIC_NETWORK ?? 'testnet') as NetworkId
  return network
}

export async function getTokenList(): Promise<Token[]> {
  const url = `https://raw.githubusercontent.com/alephium/token-list/master/tokens/${getNetwork()}.json`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  const data: TokenList = await response.json() // Ensure type assertion here
  return data.tokens // Correctly returning the value
}

export function findTokenFromId(tokenList: Token[], tokenId: string): Token | undefined {
  return tokenList?.find((token) => token.id === tokenId)
}
