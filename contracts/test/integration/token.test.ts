import { web3, DUST_AMOUNT, stringToHex, MINIMAL_CONTRACT_DEPOSIT, addressFromContractId, hexToString, ONE_ALPH, ALPH_TOKEN_ID } from '@alephium/web3'
import { expectAssertionError, mintToken, testNodeWallet, transfer } from '@alephium/web3-test'
import { deployToDevnet } from '@alephium/cli'
import { PoapFactory, PoapCollection, PoapCollectionInstance, PoapNFT } from '../../artifacts/ts'
import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { alphBalanceOf, balanceOf, getCollectionPath, getRandomSigner, loadSvg, transferAlphTo, transferTokenTo } from '../utils'
import exp from 'constants'

describe('integration tests', () => {
  const defaultGroup = 0

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)
  })

  let minter: PrivateKeyWallet
  let minter2: PrivateKeyWallet

  beforeEach(async () => {
    minter = await getRandomSigner(defaultGroup)
    minter2 = await getRandomSigner(defaultGroup)

    await transferAlphTo(minter.address, 100n * ONE_ALPH);
    await transferAlphTo(minter2.address, 100n * ONE_ALPH);
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
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1672665131000n,
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n,
        isPublic: false,
        oneMintPerAddress: false,
        isBurnable: false,
        amountForStorageFees: 0n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n
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
        eventImage: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n,
        isPublic: false,
        oneMintPerAddress: false,
        isBurnable: false,
        amountForStorageFees: 0n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n
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

    expect((await poap.view.getTraits()).returns.length).toBe(7)

    expect(hexToString((await poap.view.getTokenUri()).returns)).toBe("data:application/json,{\"name\": \"Test 1\",\"image\": \"https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc\", \"attributes\": [{\"trait_type\": \"Event Name\", \"value\": \"Test 1\"}, {\"trait_type\": \"Description\", \"value\": \"First poap test\"}, {\"trait_type\": \"Organizer\", \"value\": \"00bee85f379545a2ed9f6cceb331288842f378cf0f04012ad4ac8824aae7d6f80a\"}, {\"trait_type\": \"Location\", \"value\": \"Online\"}, {\"trait_type\": \"Event Start At\", \"value\": 1735823531000}, {\"trait_type\": \"Event End At\", \"value\": 1735823531000}]}")
  }, 20000)


  it('Mint poap trough Factory with SVG', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactory)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }


    const svg = await loadSvg('https://raw.githubusercontent.com/alephium/alephium-brand-guide/refs/heads/master/logos/svgs/Alephium-Logo-round.svg')


    await factory.transact.mintNewCollection({
      args: {
        eventImage: stringToHex(svg),
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n,
        isPublic: false,
        oneMintPerAddress: false,
        isBurnable: false,
        amountForStorageFees: 0n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n
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

    expect((await poap.view.getTraits()).returns.length).toBe(7)
    expect(hexToString(poapState.fields.eventImage)).toBe(svg)
    expect(hexToString((await poap.view.getTokenUri()).returns)).not.toBe('https://fjfjf.com/afjhd')

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
        eventImage: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n,
        isPublic: false,
        oneMintPerAddress: false,
        isBurnable: false,
        amountForStorageFees: 0n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n
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

    expect((await poap.view.getTraits()).returns.length).toBe(7)

  }, 20000)


  it('Mint poap with Contract Storage paid', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactory)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

    await factory.transact.mintNewCollection({
      args: {
        eventImage: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n,
        isPublic: false,
        oneMintPerAddress: false,
        isBurnable: false,
        amountForStorageFees: 3n * 10n ** 17n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n
      },
      signer: signer,
      attoAlphAmount: 3n*10n**17n + DUST_AMOUNT
    })

    // Check that event is emitted
    const { events } = await web3
      .getCurrentNodeProvider()
      .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(1)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    

    const collection = PoapCollection.at(addressFromContractId(poapCollectionMinted))
    let collectionState = await collection.fetchState()
    expect((await alphBalanceOf(collection.address))).toEqual(collectionState.fields.amountForStorageFees)
    expect((await alphBalanceOf(collection.address))).toEqual(3n*10n**17n)

    await collection.transact.mint({
      signer: minter,
      attoAlphAmount: DUST_AMOUNT,
      args: {
        callerAddr: minter.address
      }
    })

    collectionState = await collection.fetchState()
    expect((await alphBalanceOf(collection.address))).toEqual(collectionState.fields.amountForStorageFees)
    expect((await alphBalanceOf(collection.address))).toEqual(3n*10n**17n -10n**17n)

    expect((await collection.view.totalSupply()).returns).toBe(1n)

    await collection.transact.mint({
      signer: minter,
      attoAlphAmount:DUST_AMOUNT,
      args: {
        callerAddr: minter.address
      }
    })

    collectionState = await collection.fetchState()
    expect(collectionState.fields.amountForStorageFees).toEqual(MINIMAL_CONTRACT_DEPOSIT) //the storage fees for the collection contract
    expect((await alphBalanceOf(collection.address))).toEqual(MINIMAL_CONTRACT_DEPOSIT)

    // contract is empty, user need to pay for storage
    await collection.transact.mint({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        callerAddr: minter.address
      }
    })

    // get Poap    
    const poap = PoapNFT.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 0n } })).returns))
    const poapState = await poap.fetchState()
    expect(hexToString(poapState.fields.eventName)).toBe('Test 1')

    expect((await poap.view.getTraits()).returns.length).toBe(7)

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
        eventImage: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        maxSupply: 1n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n,
        isPublic: false,
        oneMintPerAddress: false,
        isBurnable: false,
        amountForStorageFees: 0n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n
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
    }), addressFromContractId(poapCollectionMinted), 3)

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
        eventImage: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        maxSupply: 1n,
        mintStartAt: BigInt(Date.now() + 4 * 1000),
        mintEndAt: 1893595576000n,
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n,
        isPublic: false,
        oneMintPerAddress: false,
        isBurnable: false,
        amountForStorageFees: 0n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n
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
    }), addressFromContractId(poapCollectionMinted), 5)

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
        eventImage: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        maxSupply: 1n,
        mintStartAt: BigInt(Date.now() - 60 * 1000),
        mintEndAt: BigInt(Date.now() - 4 * 1000),
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n,
        isPublic: false,
        oneMintPerAddress: false,
        isBurnable: false,
        amountForStorageFees: 0n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n
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
    }), addressFromContractId(poapCollectionMinted), 4)

  }, 20000)


  it('Mint second time with same address', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactory)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

    await factory.transact.mintNewCollection({
      args: {
        eventImage: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        maxSupply: 100n,
        mintStartAt: BigInt(Date.now() - 10000 * 1000),
        mintEndAt: BigInt(Date.now() + 10000 * 1000),
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n,
        isPublic: false,
        oneMintPerAddress: true,
        isBurnable: false,
        amountForStorageFees: 0n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n
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


    await expectAssertionError(collection.transact.mint({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        callerAddr: minter.address
      }
    }), addressFromContractId(poapCollectionMinted), 6)


    await collection.transact.mint({
      signer: minter2,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        callerAddr: minter2.address
      }
    })

  }, 20000)

  it('Mint second time with same address with factory', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactory)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

    await factory.transact.mintNewCollection({
      args: {
        eventImage: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        maxSupply: 100n,
        mintStartAt: BigInt(Date.now() - 10000 * 1000),
        mintEndAt: BigInt(Date.now() + 10000 * 1000),
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n,
        isPublic: false,
        oneMintPerAddress: true,
        isBurnable: false,
        amountForStorageFees: 0n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n
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

    await factory.transact.mintPoap({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    })


    await expectAssertionError(factory.transact.mintPoap({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    }), addressFromContractId(poapCollectionMinted), 6)


    await factory.transact.mintPoap({
      signer: minter2,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    })

  }, 20000)

  it('Mint second time with same address with factory', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactory)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

    await factory.transact.mintNewCollection({
      args: {
        eventImage: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        maxSupply: 100n,
        mintStartAt: BigInt(Date.now() - 10000 * 1000),
        mintEndAt: BigInt(Date.now() + 10000 * 1000),
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n,
        isPublic: false,
        oneMintPerAddress: true,
        isBurnable: false,
        amountForStorageFees: 0n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n
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

   
   expect((await collection.view.nftByAddress({ args: {
     caller: minter.address
   } })).returns).toBeDefined()

    await expectAssertionError(factory.transact.mintPoap({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    }), addressFromContractId(poapCollectionMinted), 6)


    await factory.transact.mintPoap({
      signer: minter2,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    })

  }, 20000)

  it('Mint poap and burn it', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactory)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

    await factory.transact.mintNewCollection({
      args: {
        eventImage: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n,
        isPublic: false,
        oneMintPerAddress: false,
        isBurnable: true,
        amountForStorageFees: 0n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n
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

    await factory.transact.mintPoap({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    })

    expect((await collection.view.totalSupply()).returns).toBe(1n)

     
    expectAssertionError(collection.view.nftByAddress({ args: {
     caller: minter.address
   } }), addressFromContractId(poapCollectionMinted), 6)

    // get Poap    
    const poap = PoapNFT.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 0n } })).returns))
    await poap.transact.burn({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

  }, 20000)


  it('Mint poap and burn unburnable', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactory)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

    await factory.transact.mintNewCollection({
      args: {
        eventImage: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n,
        isPublic: false,
        oneMintPerAddress: false,
        isBurnable: false,
        amountForStorageFees: 0n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n
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

    await factory.transact.mintPoap({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    })

    expect((await collection.view.totalSupply()).returns).toBe(1n)

    // get Poap    
    const poap = PoapNFT.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 0n } })).returns))

    await expectAssertionError(poap.transact.burn({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    }), addressFromContractId(poap.contractId), 8)

  }, 20000)

  it('Mint poap, set price ALPH', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactory)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

    await factory.transact.mintNewCollection({
      args: {
        eventImage: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n,
        isPublic: false,
        oneMintPerAddress: false,
        isBurnable: false,
        amountForStorageFees: 0n,
        poapPrice: ONE_ALPH,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n
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

    await factory.transact.mintPoap({
      signer: minter,
      attoAlphAmount: ONE_ALPH + MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    })

    expect((await collection.view.totalSupply()).returns).toBe(1n)
    expect((await alphBalanceOf(collection.address))).toBe(ONE_ALPH + MINIMAL_CONTRACT_DEPOSIT)

    /*await expectAssertionError( factory.transact.mintPoap({
      signer: minter,
      attoAlphAmount:  MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    }), addressFromContractId(collection.contractId), 9)*/

    await collection.transact.claimFunds({
      args: {
        amountToClaim: ONE_ALPH
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: signer
    })

    expect((await alphBalanceOf(collection.address))).toBe(MINIMAL_CONTRACT_DEPOSIT)

    await expectAssertionError( collection.transact.claimFunds({
      args: {
        amountToClaim: 100n
      },
      signer: minter
    }), addressFromContractId(collection.contractId), 7)

   
  }, 20000)


  it('Mint poap, set price custom token', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactory)

    expect(factory).toBeDefined()


    if (!factory) {
      throw new Error('Factory is undefined')
    }

    const customTokenA = await mintToken((await signer.getSelectedAccount()).address, 200n)

    await factory.transact.mintNewCollection({
      args: {
        eventImage: stringToHex('https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc'),
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        eventName: stringToHex('Test 1'),
        description: stringToHex('First poap test'),
        location: stringToHex('Online'),
        eventStartAt: 1735823531000n,
        eventEndAt: 1735823531000n,
        totalSupply: 0n,
        isPublic: false,
        oneMintPerAddress: false,
        isBurnable: false,
        amountForStorageFees: 0n,
        poapPrice: 1n,
        tokenIdPoap: customTokenA.contractId,
        amountPoapFees: 0n
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

    await transferTokenTo(minter.address, customTokenA.contractId, 1n)

    await factory.transact.mintPoap({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      tokens: [{
        id: customTokenA.contractId,
        amount: 1n
      }],
      args: {
        collection: collection.contractId
      }
    })

    expect((await collection.view.totalSupply()).returns).toBe(1n)
    expect((await alphBalanceOf(collection.address))).toBe(MINIMAL_CONTRACT_DEPOSIT)
    expect((await balanceOf(collection.address, customTokenA.contractId)).amount).toBe("1")

    
    await expect(factory.transact.mintPoap({
      signer: minter,
      attoAlphAmount: ONE_ALPH + MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      tokens: [{
        id: customTokenA.contractId,
        amount: 1n
      }],
      args: {
        collection: collection.contractId
      }
    })).rejects.toThrowError()
    
    /*await expectAssertionError( factory.transact.mintPoap({
      signer: minter,
      attoAlphAmount: ONE_ALPH + MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      tokens: [{
        id: customTokenA.contractId,
        amount: 1n
      }],
      args: {
        collection: collection.contractId
      }
    }), addressFromContractId(collection.contractId), 9)*/

   
  }, 20000)

})



