import { web3, DUST_AMOUNT, stringToHex, MINIMAL_CONTRACT_DEPOSIT, addressFromContractId, hexToString, ONE_ALPH } from '@alephium/web3'
import { expectAssertionError, testNodeWallet } from '@alephium/web3-test'
import { deployToDevnet } from '@alephium/cli'
import { PoapFactory, PoapCollection, PoapCollectionInstance, PoapNFT } from '../../artifacts/ts'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { getCollectionPath, getRandomSigner, transferAlphTo } from '../utils'

describe('integration tests', () => {
  const defaultGroup = 0

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
  })
  
  let minter: PrivateKeyWallet

  beforeEach(async () => {
    minter = await getRandomSigner(defaultGroup)

    await transferAlphTo(minter.address, 100n * ONE_ALPH);
  })


  it('deploy collection', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactory)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

    await factory.transact.mintNewCollection({
      args: {
        collectionUri: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        nftUri: stringToHex('https://fjfjf.com/afjhd'),
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1672665131000n,
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        organizer: (await signer.getSelectedAccount()).address,
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n
      },
      signer: signer,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

    const factoryState = await PoapFactory.at(factory.address).fetchState()
    expect(factoryState.fields.numMintedCollection).toBe(1n)

    // Check that event is emitted
    const { events } = await web3
    .getCurrentNodeProvider()
    .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(1)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    let state = await PoapCollection.at(addressFromContractId(poapCollectionMinted)).fetchState()
    expect(hexToString(state.fields.eventName)).toBe('Test 1')
    expect(state.fields.maxSupply).toBe(10n)

  }, 20000)

  it('Mint poap trough Factory', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactory)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    } 
    
    await factory.transact.mintNewCollection({
      args: {
        collectionUri: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        nftUri: stringToHex('https://fjfjf.com/afjhd'),
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        organizer: (await signer.getSelectedAccount()).address,
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n
      },
      signer: signer,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

    // Check that event is emitted
    const { events } = await web3
    .getCurrentNodeProvider()
    .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(1)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string
    
    const collection = PoapCollection.at(addressFromContractId(poapCollectionMinted))

    await collection.transact.mint({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        callerAddr: minter.address
      }
    })
    
    expect((await collection.view.totalSupply()).returns).toBe(1n)

    
    await factory.transact.mintPoap({
      args: {
        collection: collection.contractId,
      },
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

     
    expect((await collection.view.totalSupply()).returns).toBe(2n)

    // get Poap    
    const poap = PoapNFT.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 0n } })).returns))
    const poapState = await poap.fetchState()
    expect(hexToString(poapState.fields.eventName)).toBe('Test 1')

    expect((await poap.view.getTraits()).returns.length).toBe(6)

  }, 20000)

  it('Mint poap', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactory)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    } 
    
    await factory.transact.mintNewCollection({
      args: {
        collectionUri: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        nftUri: stringToHex('https://fjfjf.com/afjhd'),
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        organizer: (await signer.getSelectedAccount()).address,
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n
      },
      signer: signer,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

    // Check that event is emitted
    const { events } = await web3
    .getCurrentNodeProvider()
    .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(1)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string
    
    const collection = PoapCollection.at(addressFromContractId(poapCollectionMinted))

    await collection.transact.mint({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        callerAddr: minter.address
      } 
    })
    
    expect((await collection.view.totalSupply()).returns).toBe(1n)

    // get Poap    
    const poap = PoapNFT.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 0n } })).returns))
    const poapState = await poap.fetchState()
    expect(hexToString(poapState.fields.eventName)).toBe('Test 1')

    expect((await poap.view.getTraits()).returns.length).toBe(6)

  }, 20000)


  it('Mint poap more than supply', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactory)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    } 
    
    await factory.transact.mintNewCollection({
      args: {
        collectionUri: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        nftUri: stringToHex('https://fjfjf.com/afjhd'),
        maxSupply: 1n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        organizer: (await signer.getSelectedAccount()).address,
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n
      },
      signer: signer,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })
    
    // Check that event is emitted
    const { events } = await web3
    .getCurrentNodeProvider()
    .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(1)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    const collection = PoapCollection.at(addressFromContractId(poapCollectionMinted))

    await collection.transact.mint({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        callerAddr: minter.address
      }
    })
    
    expect((await collection.view.totalSupply()).returns).toBe(1n)

    await expectAssertionError(collection.transact.mint({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        callerAddr: minter.address
      }  
    }),addressFromContractId(poapCollectionMinted), 3)

  }, 20000)


  it('Mint poap before start', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactory)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    } 
    
    await factory.transact.mintNewCollection({
      args: {
        collectionUri: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        nftUri: stringToHex('https://fjfjf.com/afjhd'),
        maxSupply: 1n,
        mintStartAt: BigInt(Date.now() + 4 * 1000),
        mintEndAt: 1893595576000n,
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        organizer: (await signer.getSelectedAccount()).address,
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n

      },
      signer: signer,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })
    // Check that event is emitted
    const { events } = await web3
    .getCurrentNodeProvider()
    .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(1)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    const collection = PoapCollection.at(addressFromContractId(poapCollectionMinted))
    
    await expectAssertionError(collection.transact.mint({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        callerAddr: minter.address
      }
    }),addressFromContractId(poapCollectionMinted), 5)

  }, 20000)

  it('Mint poap after end', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactory)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    } 
    
    await factory.transact.mintNewCollection({
      args: {
        collectionUri: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        nftUri: stringToHex('https://fjfjf.com/afjhd'),
        maxSupply: 1n,
        mintStartAt: BigInt(Date.now()-60*1000),
        mintEndAt: BigInt(Date.now()-4*1000),
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        organizer: (await signer.getSelectedAccount()).address,
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n
      },
      signer: signer,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })
    
    // Check that event is emitted
    const { events } = await web3
    .getCurrentNodeProvider()
    .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(1)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    const collection = PoapCollection.at(addressFromContractId(poapCollectionMinted))
    
    await expectAssertionError(collection.transact.mint({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        callerAddr: minter.address
      }
    }),addressFromContractId(poapCollectionMinted), 4)

  }, 20000)

})

