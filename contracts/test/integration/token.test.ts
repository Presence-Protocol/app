import { web3, DUST_AMOUNT, stringToHex, MINIMAL_CONTRACT_DEPOSIT, addressFromContractId, hexToString, ONE_ALPH, ALPH_TOKEN_ID, number256ToBigint, NULL_CONTRACT_ADDRESS } from '@alephium/web3'
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
  let minter3: PrivateKeyWallet

  beforeEach(async () => {
    minter = await getRandomSigner(defaultGroup)
    minter2 = await getRandomSigner(defaultGroup)
    minter3 = await getRandomSigner(defaultGroup)


    await transferAlphTo(minter.address, 100n * ONE_ALPH);
    await transferAlphTo(minter2.address, 100n * ONE_ALPH);
    await transferAlphTo(minter3.address, 100n * ONE_ALPH);

  },20000)


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
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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

    expect((await poap.view.getTraits()).returns.length).toBe(8)

    expect(hexToString((await poap.view.getTokenUri()).returns)).toBe("data:application/json,{\"name\": \"Test 1\",\"image\": \"https://arweave.net/Z1HAdT_PGnxPLct4-u7l1Zl_h4DNdxzKev7tCDAEflc\", \"attributes\": [{\"trait_type\": \"Event Name\", \"value\": \"Test 1\"}, {\"trait_type\": \"Description\", \"value\": \"First poap test\"}, {\"trait_type\": \"Organizer\", \"value\": \"00bee85f379545a2ed9f6cceb331288842f378cf0f04012ad4ac8824aae7d6f80a\"}, {\"trait_type\": \"Location\", \"value\": \"Online\"}, {\"trait_type\": \"Event Start At\", \"value\": 1735823531000}, {\"trait_type\": \"Event End At\", \"value\": 1735823531000},{\"trait_type\": \"Has Particpated\", \"value\": false}]}")

  }, 20000)


  it('Mint poap trough Factory with SVG', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactory)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }


    const svg = await loadSvg('https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/accessible.svg')


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
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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

    expect((await poap.view.getTraits()).returns.length).toBe(8)
    expect(hexToString(poapState.fields.eventImage)).toBe(svg)
    expect(hexToString((await poap.view.getTokenUri()).returns)).not.toBe('https://fjfjf.com/afjhd')

  }, 50000)


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
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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

    expect((await poap.view.getTraits()).returns.length).toBe(8)

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
        amountForStorageFees: 2n * 10n ** 17n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
      },
      signer: signer,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n*10n ** 17n + DUST_AMOUNT
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
    expect((await alphBalanceOf(collection.address))).toEqual(collectionState.fields.amountForStorageFees + MINIMAL_CONTRACT_DEPOSIT)
    expect((await alphBalanceOf(collection.address))).toEqual(3n*10n**17n)

    await collection.transact.mint({
      signer: minter,
      attoAlphAmount: DUST_AMOUNT,
      args: {
        callerAddr: minter.address
      }
    })

    collectionState = await collection.fetchState()
    expect((await alphBalanceOf(collection.address))).toEqual(collectionState.fields.amountForStorageFees + MINIMAL_CONTRACT_DEPOSIT)
    expect((await alphBalanceOf(collection.address))).toEqual(2n*10n**17n)

    expect((await collection.view.totalSupply()).returns).toBe(1n)

    await collection.transact.mint({
      signer: minter,
      attoAlphAmount: DUST_AMOUNT,
      args: {
        callerAddr: minter.address
      }
    })

    collectionState = await collection.fetchState()
    expect(collectionState.fields.amountForStorageFees).toEqual(0n) //the storage fees for the collection contract
    expect((await alphBalanceOf(collection.address))).toEqual(MINIMAL_CONTRACT_DEPOSIT)

    // contract is empty, user need to pay for storage
    await collection.transact.mint({
      signer: minter2,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        callerAddr: minter.address
      }
    })

    // should failed because there's no ALPH left in the sc to pay the storage fees
   await expect(collection.transact.mint({
      signer: minter2,
      attoAlphAmount: DUST_AMOUNT,
      args: {
        callerAddr: minter.address
      }
    })).rejects.toThrowError()

    // get Poap    
    const poap = PoapNFT.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 0n } })).returns))
    const poapState = await poap.fetchState()
    expect(hexToString(poapState.fields.eventName)).toBe('Test 1')

    expect((await poap.view.getTraits()).returns.length).toBe(8)

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
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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

    await transferTokenTo(minter.address, customTokenA.contractId, 2n)

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

    expect((await collection.view.totalSupply()).returns).toBe(2n)
    expect((await alphBalanceOf(collection.address))).toBe(MINIMAL_CONTRACT_DEPOSIT)
    expect((await balanceOf(collection.address, customTokenA.contractId)).amount).toBe("2")

    
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

    expect(number256ToBigint((await balanceOf(collection.address, customTokenA.contractId)).amount)).toBe(2n)

    await collection.transact.claimFunds({
      args: {
        amountToClaim: 1n
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: signer
    })

    expect(number256ToBigint((await balanceOf(collection.address, customTokenA.contractId)).amount)).toBe(1n)

    await collection.transact.claimFunds({
      args: {
        amountToClaim: 1n
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: signer
    })

    expect(number256ToBigint((await balanceOf(collection.address, customTokenA.contractId)).amount)).toBe(0n)

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


  it('Mint poap, set aidrop with custom token', async () => {
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
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n,
        tokenIdAirdrop: customTokenA.contractId,
        amountAirdropPerUser: 10n,
        amountAirdrop: 20n,
        airdropWhenHasParticipated: false
      },
      signer: signer,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      tokens: [{
        id: customTokenA.tokenId,
        amount: 20n
      }]
    })

    // Check that event is emitted
    const { events } = await web3
      .getCurrentNodeProvider()
      .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(1)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    const collection = PoapCollection.at(addressFromContractId(poapCollectionMinted))
    expect(number256ToBigint((await balanceOf(collection.address, customTokenA.contractId)).amount)).toBe(20n)


    await factory.transact.mintPoap({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n*DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    })
    expect(number256ToBigint((await balanceOf(minter.account.address, customTokenA.tokenId)).amount)).toBe(10n)

    expect(number256ToBigint((await balanceOf(collection.address, customTokenA.contractId)).amount)).toBe(10n)


    await factory.transact.mintPoap({
      signer: minter2,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n*DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    })
    expect(number256ToBigint((await balanceOf(minter2.account.address, customTokenA.tokenId)).amount)).toBe(10n)


    expect((await collection.view.totalSupply()).returns).toBe(2n)
    expect((await alphBalanceOf(collection.address))).toBe(MINIMAL_CONTRACT_DEPOSIT)
    expect(number256ToBigint((await balanceOf(collection.address, customTokenA.tokenId)).amount)).toBe(0n)

    await factory.transact.mintPoap({
      signer: minter3,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    })
    expect(number256ToBigint((await balanceOf(minter3.account.address, customTokenA.tokenId)).amount)).toBe(0n)


   
  }, 20000)


  it('Mint poap, set aidrop with ALPH', async () => {
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
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 10n * ONE_ALPH,
        amountAirdrop: 20n * ONE_ALPH,
        airdropWhenHasParticipated: false
      },
      signer: signer,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT + 20n * ONE_ALPH,

    })

    // Check that event is emitted
    const { events } = await web3
      .getCurrentNodeProvider()
      .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(1)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    const collection = PoapCollection.at(addressFromContractId(poapCollectionMinted))
    expect(await alphBalanceOf(collection.address)).toBe(20n * ONE_ALPH + MINIMAL_CONTRACT_DEPOSIT)


    await factory.transact.mintPoap({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n*DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    })
    expect(await alphBalanceOf(minter.address)).toBeGreaterThan(109n * ONE_ALPH)

    expect(await alphBalanceOf(collection.address)).toBe(10n * ONE_ALPH + MINIMAL_CONTRACT_DEPOSIT)



    await factory.transact.mintPoap({
      signer: minter2,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n*DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    })
    expect(await alphBalanceOf(minter2.address)).toBeGreaterThan(109n * ONE_ALPH)


    expect((await collection.view.totalSupply()).returns).toBe(2n)
    expect((await alphBalanceOf(collection.address))).toBe(MINIMAL_CONTRACT_DEPOSIT)
    expect(await alphBalanceOf(collection.address)).toBe(MINIMAL_CONTRACT_DEPOSIT)

    await factory.transact.mintPoap({
      signer: minter3,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    })
    expect(await alphBalanceOf(minter3.address)).toBeGreaterThan(109n * ONE_ALPH)


   
  }, 20000)

  it('Mint poap, set aidrop with custom token and storage fees are paid', async () => {
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
        amountForStorageFees: 2n * 10n ** 17n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n,
        tokenIdAirdrop: customTokenA.contractId,
        amountAirdropPerUser: 10n,
        amountAirdrop: 20n,
        airdropWhenHasParticipated: false
      },
      signer: signer,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT + 2n*10n**17n,
      tokens: [{
        id: customTokenA.tokenId,
        amount: 20n
      }]
    })

    // Check that event is emitted
    const { events } = await web3
      .getCurrentNodeProvider()
      .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(1)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    const collection = PoapCollection.at(addressFromContractId(poapCollectionMinted))
    expect(number256ToBigint((await balanceOf(collection.address, customTokenA.contractId)).amount)).toBe(20n)
    expect(await alphBalanceOf(collection.address)).toBe(3n*10n**17n)


    await factory.transact.mintPoap({
      signer: minter,
      attoAlphAmount:  2n*DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    })
    expect(number256ToBigint((await balanceOf(minter.account.address, customTokenA.tokenId)).amount)).toBe(10n)

    let collectionState = await collection.fetchState()
    expect(number256ToBigint((await balanceOf(collection.address, customTokenA.contractId)).amount)).toBe(10n)
    expect(await alphBalanceOf(collection.address)).toBe(2n*10n**17n)
    expect(collectionState.fields.amountForStorageFees).toBe(10n**17n)


    await factory.transact.mintPoap({
      signer: minter2,
      attoAlphAmount: 2n*DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    })
    expect(number256ToBigint((await balanceOf(minter2.account.address, customTokenA.tokenId)).amount)).toBe(10n)

    expect((await collection.view.totalSupply()).returns).toBe(2n)
    expect((await alphBalanceOf(collection.address))).toBe(MINIMAL_CONTRACT_DEPOSIT)
    expect(number256ToBigint((await balanceOf(collection.address, customTokenA.tokenId)).amount)).toBe(0n)

    await factory.transact.mintPoap({
      signer: minter3,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        collection: collection.contractId
      }
    })
    expect(number256ToBigint((await balanceOf(minter3.account.address, customTokenA.tokenId)).amount)).toBe(0n)


   
  }, 20000)


  it('Mint poap trough Factory and set poap participated', async () => {
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
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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

     // get Poap    
     const poap = PoapNFT.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 0n } })).returns))
     let poapState = await poap.fetchState()
     expect(hexToString(poapState.fields.eventName)).toBe('Test 1')
     expect((await poap.view.getTraits()).returns.length).toBe(8)
     expect(hexToString((await poap.view.getTraitAtIndex({
      args: {
        index: 7n
      }
    })).returns.traitType)).toBe('Has Participated')
    expect(hexToString((await poap.view.getTraitAtIndex({
     args: {
       index: 7n
     }
   })).returns.value)).toBe("false")

    await collection.transact.setParticipatedPresence({
      args: {
        nftIndex: 0n,
        presenceAddressValidate: NULL_CONTRACT_ADDRESS,
        callerAddr: NULL_CONTRACT_ADDRESS
      },
      signer: signer,
      attoAlphAmount: 10n*DUST_AMOUNT
    })
    poapState = await poap.fetchState()

    expect(poapState.fields.hasParticipated).toBe(true)


    expect((await collection.view.totalSupply()).returns).toBe(1n)

    

    await factory.transact.mintPoap({
      args: {
        collection: collection.contractId,
      },
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

    const poap2 = PoapNFT.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 1n } })).returns))
     let poapState2 = await poap2.fetchState()
     expect(hexToString(poapState2.fields.eventName)).toBe('Test 1')
     expect((await poap2.view.getTraits()).returns.length).toBe(8)
     expect(hexToString((await poap2.view.getTraitAtIndex({
       args: {
         index: 7n
       }
     })).returns.traitType)).toBe('Has Participated')
     expect(hexToString((await poap2.view.getTraitAtIndex({
      args: {
        index: 7n
      }
    })).returns.value)).toBe('false')

    await collection.transact.setParticipatedPresence({
      args: {
        nftIndex: 1n,
        presenceAddressValidate: NULL_CONTRACT_ADDRESS,
       callerAddr: NULL_CONTRACT_ADDRESS
      },
      signer: signer,
      attoAlphAmount: DUST_AMOUNT
    })

    poapState2 = await poap2.fetchState()
    expect(poapState2.fields.hasParticipated).toBe(true)


    expect((await collection.view.totalSupply()).returns).toBe(2n)

    await factory.transact.mintPoap({
      args: {
        collection: collection.contractId,
      },
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

    expectAssertionError(
      collection.transact.setParticipatedPresence({
        args: {
          nftIndex: 2n,
          presenceAddressValidate: NULL_CONTRACT_ADDRESS,
         callerAddr: NULL_CONTRACT_ADDRESS
        },
        signer: minter,
        attoAlphAmount: DUST_AMOUNT
      })
    ,collection.address, 7)

    const poap3 = PoapNFT.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 1n } })).returns))
    expect(
      poap3.transact.setParticipated({
        signer: minter,
        attoAlphAmount: DUST_AMOUNT
      })
    ).rejects.toThrowError("ExpectAContract")
   

  }, 20000)



  it('Mint poap trough Factory and set poap participated and airdrop', async () => {
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
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n,
        tokenIdAirdrop: customTokenA.tokenId,
        amountAirdropPerUser: 10n,
        amountAirdrop: 20n,
        airdropWhenHasParticipated: true
      },
      signer: signer,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      tokens: [{
        id: customTokenA.tokenId,
        amount: 20n
      }]
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

    expect(number256ToBigint((await balanceOf(collection.address, customTokenA.tokenId)).amount)).toBe(20n)
    expect(number256ToBigint((await alphBalanceOf(collection.address)))).toBe(MINIMAL_CONTRACT_DEPOSIT)


     // get Poap    
     const poap = PoapNFT.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 0n } })).returns))
     let poapState = await poap.fetchState()
     expect(hexToString(poapState.fields.eventName)).toBe('Test 1')
     expect((await poap.view.getTraits()).returns.length).toBe(8)
     expect(hexToString((await poap.view.getTraitAtIndex({
      args: {
        index: 7n
      }
    })).returns.traitType)).toBe('Has Participated')
    expect(hexToString((await poap.view.getTraitAtIndex({
     args: {
       index: 7n
     }
   })).returns.value)).toBe("false")

    await collection.transact.setParticipatedPresence({
      args: {
        nftIndex: 0n,
        presenceAddressValidate: NULL_CONTRACT_ADDRESS,
        callerAddr: NULL_CONTRACT_ADDRESS
      },
      signer: signer,
      attoAlphAmount: 3n*DUST_AMOUNT
    })
    poapState = await poap.fetchState()

    expect(poapState.fields.hasParticipated).toBe(true)
    expect(number256ToBigint((await balanceOf(minter.account.address, customTokenA.tokenId)).amount)).toBe(10n)

    expect((await collection.view.totalSupply()).returns).toBe(1n)

    

    await factory.transact.mintPoap({
      args: {
        collection: collection.contractId,
      },
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

    const poap2 = PoapNFT.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 1n } })).returns))
     let poapState2 = await poap2.fetchState()
     expect(hexToString(poapState2.fields.eventName)).toBe('Test 1')
     expect((await poap2.view.getTraits()).returns.length).toBe(8)
     expect(hexToString((await poap2.view.getTraitAtIndex({
       args: {
         index: 7n
       }
     })).returns.traitType)).toBe('Has Participated')
     expect(hexToString((await poap2.view.getTraitAtIndex({
      args: {
        index: 7n
      }
    })).returns.value)).toBe('false')

    await collection.transact.setParticipatedPresence({
      args: {
        nftIndex: 1n,
        presenceAddressValidate: NULL_CONTRACT_ADDRESS,
       callerAddr: NULL_CONTRACT_ADDRESS
      },
      signer: signer,
      attoAlphAmount: DUST_AMOUNT
    })

    poapState2 = await poap2.fetchState()
    expect(poapState2.fields.hasParticipated).toBe(true)
    expect(number256ToBigint((await balanceOf(minter.account.address, customTokenA.tokenId)).amount)).toBe(20n)


    expect((await collection.view.totalSupply()).returns).toBe(2n)

    await factory.transact.mintPoap({
      args: {
        collection: collection.contractId,
      },
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })
    expect(number256ToBigint((await balanceOf(minter.account.address, customTokenA.tokenId)).amount)).toBe(20n)


    expectAssertionError(
      collection.transact.setParticipatedPresence({
        args: {
          nftIndex: 2n,
          presenceAddressValidate: NULL_CONTRACT_ADDRESS,
         callerAddr: NULL_CONTRACT_ADDRESS
        },
        signer: minter,
        attoAlphAmount: DUST_AMOUNT
      })
    ,collection.address, 7)

    const poap3 = PoapNFT.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 1n } })).returns))
    expect(
      poap3.transact.setParticipated({
        signer: minter,
        attoAlphAmount: DUST_AMOUNT
      })
    ).rejects.toThrowError("ExpectAContract")
   

  }, 20000)

  it('Mint poap trough Factory and set poap participated with address index', async () => {
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
        oneMintPerAddress: true,
        isBurnable: false,
        amountForStorageFees: 0n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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

     // get Poap for minter  
     const poap = PoapNFT.at(addressFromContractId((await collection.view.nftByAddress({
       args: {
         caller: minter.address
       }
     })).returns))
     let poapState = await poap.fetchState()
     expect(hexToString(poapState.fields.eventName)).toBe('Test 1')
     expect((await poap.view.getTraits()).returns.length).toBe(8)
     expect(hexToString((await poap.view.getTraitAtIndex({
      args: {
        index: 7n
      }
    })).returns.traitType)).toBe('Has Participated')
    expect(hexToString((await poap.view.getTraitAtIndex({
     args: {
       index: 7n
     }
   })).returns.value)).toBe("false")

    await collection.transact.setParticipatedPresence({
      args: {
        nftIndex: 0n,
        presenceAddressValidate: minter.address,
       callerAddr: NULL_CONTRACT_ADDRESS
      },
      signer: signer,
      attoAlphAmount: DUST_AMOUNT
    })
    poapState = await poap.fetchState()

    expect(poapState.fields.hasParticipated).toBe(true)


    expect((await collection.view.totalSupply()).returns).toBe(1n)

    
    // get Poap for minter2
    await factory.transact.mintPoap({
      args: {
        collection: collection.contractId,
      },
      signer: minter2,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

    const poap2 = PoapNFT.at(addressFromContractId((await collection.view.nftByAddress({
      args: {
        caller: minter2.address
      }
    })).returns))
     let poapState2 = await poap2.fetchState()
     expect(hexToString(poapState2.fields.eventName)).toBe('Test 1')
     expect((await poap2.view.getTraits()).returns.length).toBe(8)
     expect(hexToString((await poap2.view.getTraitAtIndex({
       args: {
         index: 7n
       }
     })).returns.traitType)).toBe('Has Participated')
     expect(hexToString((await poap2.view.getTraitAtIndex({
      args: {
        index: 7n
      }
    })).returns.value)).toBe('false')

    await collection.transact.setParticipatedPresence({
      args: {
        nftIndex: 0n,
        presenceAddressValidate: minter2.address,
       callerAddr: NULL_CONTRACT_ADDRESS
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: signer
    })

    poapState2 = await poap2.fetchState()
    expect(poapState2.fields.hasParticipated).toBe(true)

    expectAssertionError(collection.transact.setParticipatedPresence({
      args: {
        nftIndex: 0n,
        presenceAddressValidate: minter2.address,
       callerAddr: NULL_CONTRACT_ADDRESS
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: signer
    }), poap2.address, 10)


    expect((await collection.view.totalSupply()).returns).toBe(2n)

    await factory.transact.mintPoap({
      args: {
        collection: collection.contractId,
      },
      signer: minter3,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

    expectAssertionError(
      collection.transact.setParticipatedPresence({
        args: {
          nftIndex: 0n,
          presenceAddressValidate: minter3.address,
         callerAddr: NULL_CONTRACT_ADDRESS
        },
        signer: minter,
        attoAlphAmount: DUST_AMOUNT
      })
    ,collection.address, 7)
   

  }, 20000)

  it('Mint poap trough Factory and set poap participated trough factory with address index', async () => {
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
        oneMintPerAddress: true,
        isBurnable: false,
        amountForStorageFees: 0n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        amountPoapFees: 0n,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false
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

     // get Poap for minter  
     const poap = PoapNFT.at(addressFromContractId((await collection.view.nftByAddress({
       args: {
         caller: minter.address
       }
     })).returns))
     let poapState = await poap.fetchState()
     expect(hexToString(poapState.fields.eventName)).toBe('Test 1')
     expect((await poap.view.getTraits()).returns.length).toBe(8)
     expect(hexToString((await poap.view.getTraitAtIndex({
      args: {
        index: 7n
      }
    })).returns.traitType)).toBe('Has Participated')
    expect(hexToString((await poap.view.getTraitAtIndex({
     args: {
       index: 7n
     }
   })).returns.value)).toBe("false")

    await factory.transact.setParticipatedPresence({
      args: {
        collection: collection.contractId,
        nftIndex: 0n,
        presenceAddressValidate: minter.address
      },
      signer: signer,
      attoAlphAmount: DUST_AMOUNT
    })
    poapState = await poap.fetchState()

    expect(poapState.fields.hasParticipated).toBe(true)


    expect((await collection.view.totalSupply()).returns).toBe(1n)

    
    // get Poap for minter2
    await factory.transact.mintPoap({
      args: {
        collection: collection.contractId,
      },
      signer: minter2,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

    const poap2 = PoapNFT.at(addressFromContractId((await collection.view.nftByAddress({
      args: {
        caller: minter2.address
      }
    })).returns))
     let poapState2 = await poap2.fetchState()
     expect(hexToString(poapState2.fields.eventName)).toBe('Test 1')
     expect((await poap2.view.getTraits()).returns.length).toBe(8)
     expect(hexToString((await poap2.view.getTraitAtIndex({
       args: {
         index: 7n
       }
     })).returns.traitType)).toBe('Has Participated')
     expect(hexToString((await poap2.view.getTraitAtIndex({
      args: {
        index: 7n
      }
    })).returns.value)).toBe('false')

    await factory.transact.setParticipatedPresence({
      args: {
        collection: collection.contractId,
        nftIndex: 0n,
        presenceAddressValidate: minter2.address
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: signer
    })

    poapState2 = await poap2.fetchState()
    expect(poapState2.fields.hasParticipated).toBe(true)

    expectAssertionError(factory.transact.setParticipatedPresence({
      args: {
        nftIndex: 0n,
        presenceAddressValidate: minter2.address,
        collection: collection.contractId
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: signer
    }), poap2.address, 10)


    expect((await collection.view.totalSupply()).returns).toBe(2n)

    await factory.transact.mintPoap({
      args: {
        collection: collection.contractId,
      },
      signer: minter3,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

    expectAssertionError(
      factory.transact.setParticipatedPresence({
        args: {
          collection: collection.address,
          nftIndex: 0n,
          presenceAddressValidate: minter3.address
        },
        signer: minter,
        attoAlphAmount: DUST_AMOUNT
      })
    ,factory.address, 7)
   

  }, 20000)

})



