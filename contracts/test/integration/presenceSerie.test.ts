import { addressFromContractId, ALPH_TOKEN_ID, DUST_AMOUNT, hexToString, MINIMAL_CONTRACT_DEPOSIT, number256ToBigint, ONE_ALPH, stringToHex, TransactionBuilder, web3 } from "@alephium/web3"
import { PrivateKeyWallet } from "@alephium/web3-wallet"
import { alphBalanceOf, balanceOf, getRandomSigner, transferAlphTo, transferTokenTo } from "../utils"
import { deployToDevnet } from "@alephium/cli"
import { expectAssertionError, mintToken, testNodeWallet } from "@alephium/web3-test"
import { NewPresenceNewEvent, PoapCollectionV2, PoapData, PoapFactoryV2, PoapNFTSerieV2, PoapSerieCollectionV2 } from "../../artifacts/ts"

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
  }, 20000)

  it('deploy serie collection and new event', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactoryV2)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

    await factory.transact.mintNewCollectionWithSerie({
      args: {
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false
      },
      signer: signer,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })


    const factoryState = await PoapFactoryV2.at(factory.address).fetchState()
    expect(factoryState.fields.numMintedCollection).toBe(1n)

    // Check that event is emitted
    const { events } = await web3
      .getCurrentNodeProvider()
      .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(1)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string
    const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))

    let state = await collection.fetchState()
    expect(hexToString(state.fields.collectionName)).toBe('Test 1')
    expect(state.fields.totalSupply).toBe(0n)

    await factory.transact.createNewEvent({
      args: {
        collection: collection.contractId,
        maxSupply: 10n,
        mintStartAt: 0n,
        mintEndAt: 0n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        isOpenPrice: false,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        airdropWhenHasParticipated: false,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Serie 1"),
        description: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        isPublic: false,
        isBurnable: false,
        lockedUntil: 0n,
        hashedPassword: "",
        amountAirdrop: 0n,
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      signer: signer,
      attoAlphAmount: 2n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })



  })

  it('deploy serie collection and new event with txscript', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactoryV2)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }


    await NewPresenceNewEvent.execute({
      signer,
      initialFields: {
        factory: factory.contractId,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false,
        maxSupply: 0n,
        mintStartAt: 0n,
        mintEndAt: 0n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        isOpenPrice: false,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        airdropWhenHasParticipated: false,
        image: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        name: stringToHex("Serie 1"),
        eventDescription: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        eventIsPublic: false,
        isBurnable: false,
        lockedUntil: 0n,
        hashedPassword: "00",
        amountAirdrop: 0n,
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      attoAlphAmount: 3n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })




  })



  it('deploy serie collection and new event with txscript and mint two', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactoryV2)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

    let now = BigInt(Date.now())

    await NewPresenceNewEvent.execute({
      signer,
      initialFields: {
        factory: factory.contractId,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false,
        maxSupply: 10n,
        mintStartAt: now - 5000n,
        mintEndAt: now + 1000n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        isOpenPrice: false,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        airdropWhenHasParticipated: false,
        image: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        name: stringToHex("Serie 1"),
        eventDescription: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        eventIsPublic: false,
        isBurnable: false,
        lockedUntil: 0n,
        hashedPassword: "00",
        amountAirdrop: 0n,
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      attoAlphAmount: 3n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })



    // Check that event is emitted
    const { events } = await web3
      .getCurrentNodeProvider()
      .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(2)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string
    const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))


    let state = await collection.fetchState()
    expect(hexToString(state.fields.collectionName)).toBe('Test 1')
    expect(state.fields.totalSupply).toBe(0n)

    await factory.transact.mintPoapSerie({
      args: {
        collection: collection.contractId,
        eventId: 0n,
        amount: 0n,
        password: "00"
      },
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })


    expect((await collection.view.totalSupply()).returns).toBe(1n)

    // get Poap    
    const poap = PoapNFTSerieV2.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 0n } })).returns))
    const poapState = await poap.fetchState()
    expect(hexToString(poapState.fields.eventName)).toBe('Serie 1')
    expect((await poap.view.getTraits()).returns.length).toBe(9)

    await factory.transact.mintPoapSerie({
      args: {
        collection: collection.contractId,
        eventId: 0n,
        amount: 0n,
        password: "00"
      },
      signer: minter2,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })


    state = await collection.fetchState()
    expect(state.fields.totalSupply).toBe(2n)
    expect(state.fields.totalSupplySeries).toBe(1n)
    expect((await collection.view.totalSupply()).returns).toBe(2n)

    let poapData = PoapData.at(addressFromContractId((await collection.view.getPoapDataByEvent({ args: { eventId: 0n } })).returns))
    expect((await poapData.view.getCurrentSupply()).returns).toBe(2n)

    await factory.transact.createNewEvent({
      args: {
        collection: collection.contractId,
        maxSupply: 10n,
        mintStartAt: now - 5000n,
        mintEndAt: now + 20000n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        isOpenPrice: false,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        airdropWhenHasParticipated: false,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Serie 1"),
        description: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        isPublic: false,
        isBurnable: false,
        lockedUntil: 0n,
        hashedPassword: "00",
        amountAirdrop: 0n,
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      signer: signer,
      attoAlphAmount: 2n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

    await factory.transact.mintPoapSerie({
      args: {
        collection: collection.contractId,
        eventId: 1n,
        amount: 0n,
        password: "00"
      },
      signer: minter2,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

    state = await collection.fetchState()
    expect(state.fields.totalSupply).toBe(3n)
    expect(state.fields.totalSupplySeries).toBe(2n)

    poapData = PoapData.at(addressFromContractId((await collection.view.getPoapDataByEvent({ args: { eventId: 1n } })).returns))
    expect((await poapData.view.getCurrentSupply()).returns).toBe(1n)

  }, 20000)


  it('Mint poap before start', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactoryV2)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

    await factory.transact.mintNewCollectionWithSerie({
      args: {
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false
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

    const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))

    await factory.transact.createNewEvent({
      args: {
        collection: collection.contractId,
        maxSupply: 10n,
        mintStartAt: BigInt(Date.now() + 4 * 1000),
        mintEndAt: 1893595576000n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        isOpenPrice: false,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        airdropWhenHasParticipated: false,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Serie 1"),
        description: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        isPublic: false,
        isBurnable: false,
        lockedUntil: 0n,
        hashedPassword: "",
        amountAirdrop: 0n,
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      signer: signer,
      attoAlphAmount: 2n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })


    await expectAssertionError(collection.transact.mint({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        eventId: 0n,
        amount: 0n,
        password: ''
      }
    }), addressFromContractId(poapCollectionMinted), 5)

  }, 20000)

  it('Mint poap after end', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactoryV2)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

    await factory.transact.mintNewCollectionWithSerie({
      args: {
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false
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

    const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))

    await factory.transact.createNewEvent({
      args: {
        collection: collection.contractId,
        maxSupply: 10n,
        mintStartAt: BigInt(Date.now() - 60 * 1000),
        mintEndAt: BigInt(Date.now() - 4 * 1000),
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        isOpenPrice: false,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        airdropWhenHasParticipated: false,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Serie 1"),
        description: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        isPublic: false,
        isBurnable: false,
        lockedUntil: 0n,
        hashedPassword: "",
        amountAirdrop: 0n,
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      signer: signer,
      attoAlphAmount: 2n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })



    await expectAssertionError(collection.transact.mint({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        eventId: 0n,
        amount: 0n,
        password: ''
      }
    }), addressFromContractId(poapCollectionMinted), 4)

  }, 20000)


  it('Mint poap, set aidrop with custom token', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactoryV2)

    expect(factory).toBeDefined()


    if (!factory) {
      throw new Error('Factory is undefined')
    }

    const customTokenA = await mintToken((await signer.getSelectedAccount()).address, 200n)
    const now = BigInt(Date.now())

    await NewPresenceNewEvent.execute( {
      signer,
      initialFields: {
        factory: factory.contractId,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false,
        maxSupply: 10n,
        mintStartAt: now - 5000n,
        mintEndAt: now + 1000n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        isOpenPrice: false,
        tokenIdAirdrop: customTokenA.contractId,
        amountAirdropPerUser: 10n,
        amountAirdrop: 20n,
        airdropWhenHasParticipated: false,
        image: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        name: stringToHex("Serie 1"),
        eventDescription: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        eventIsPublic: false,
        isBurnable: false,
        lockedUntil: 0n,
        hashedPassword: "00",
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      attoAlphAmount: 3n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      tokens: [{
        id: customTokenA.tokenId,
        amount: 20n
      }]
    })


    // Check that event is emitted
    const { events } = await web3
      .getCurrentNodeProvider()
      .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(2)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))
    const poapDataContractId = (await collection.view.getPoapDataByEvent({ args: { eventId: 0n } })).returns

    expect(number256ToBigint((await balanceOf(addressFromContractId(poapDataContractId), customTokenA.contractId)).amount)).toBe(20n)


    await factory.transact.mintPoapSerie({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n * DUST_AMOUNT,
      args: {
        eventId: 0n,
        collection: collection.contractId,
        amount: 0n,
        password: ''
      }
    })
    expect(number256ToBigint((await balanceOf(minter.account.address, customTokenA.tokenId)).amount)).toBe(10n)

    expect(number256ToBigint((await balanceOf(addressFromContractId(poapDataContractId), customTokenA.contractId)).amount)).toBe(10n)


    await factory.transact.mintPoapSerie({
      signer: minter2,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n * DUST_AMOUNT,
      args: {
        collection: collection.contractId,
        amount: 0n,
        password: '',
        eventId: 0n
      }
    })
    expect(number256ToBigint((await balanceOf(minter2.account.address, customTokenA.tokenId)).amount)).toBe(10n)


    expect((await collection.view.totalSupply()).returns).toBe(2n)
    expect((await alphBalanceOf(collection.address))).toBe(MINIMAL_CONTRACT_DEPOSIT)
    expect(number256ToBigint((await balanceOf(collection.address, customTokenA.tokenId)).amount)).toBe(0n)

    await factory.transact.mintPoapSerie({
      signer: minter3,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        collection: collection.contractId,
        amount: 0n,
        password: '',
        eventId: 0n
      }
    })
    expect(number256ToBigint((await balanceOf(minter3.account.address, customTokenA.tokenId)).amount)).toBe(0n)



  }, 20000)


  it('Mint poap, set aidrop, test withdraw', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactoryV2)

    expect(factory).toBeDefined()


    if (!factory) {
      throw new Error('Factory is undefined')
    }

    const customTokenA = await mintToken((await signer.getSelectedAccount()).address, 200n)
    const now = BigInt(Date.now())

    await NewPresenceNewEvent.execute({
      signer,
      initialFields: {
        factory: factory.contractId,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false,
        maxSupply: 10n,
        mintStartAt: now - 5000n,
        mintEndAt: now + 1000n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        isOpenPrice: false,
        tokenIdAirdrop: customTokenA.contractId,
        amountAirdropPerUser: 10n,
        amountAirdrop: 20n,
        airdropWhenHasParticipated: false,
        image: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        name: stringToHex("Serie 1"),
        eventDescription: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        eventIsPublic: false,
        isBurnable: false,
        lockedUntil: 0n,
        hashedPassword: "00",
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      attoAlphAmount: 3n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      tokens: [{
        id: customTokenA.tokenId,
        amount: 20n
      }]
    })

    // Check that event is emitted
    const { events } = await web3
      .getCurrentNodeProvider()
      .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(2)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))
    const poapData = addressFromContractId((await collection.view.getPoapDataByEvent({ args: { eventId: 0n } })).returns)
    expect(number256ToBigint((await balanceOf(poapData, customTokenA.contractId)).amount)).toBe(20n)

    expectAssertionError(collection.transact.withdrawAirdrop({
      args: {
        eventId: 0n,
        amount: 100n
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: signer
    }), poapData, 9)

    expectAssertionError(collection.transact.withdrawAirdrop({
      args: {
        eventId: 0n,
        amount: 100n
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: minter2
    }), collection.address, 7)


    await collection.transact.withdrawAirdrop({
      args: {
        eventId: 0n,
        amount: 20n
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: signer
    })

    expect(number256ToBigint((await balanceOf(poapData, customTokenA.contractId)).amount)).toBe(0n)



  }, 20000)


  it('Mint locked PAOP', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactoryV2)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

    const now = BigInt(Date.now())

    await NewPresenceNewEvent.execute({
      signer,
      initialFields: {
        factory: factory.contractId,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false,
        maxSupply: 10n,
        mintStartAt: now - 5000n,
        mintEndAt: now + 1000n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        isOpenPrice: false,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false,
        image: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        name: stringToHex("Serie 1"),
        eventDescription: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        eventIsPublic: false,
        isBurnable: false,
        lockedUntil: now + 86400n * 1000n,
        hashedPassword: "00",
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      attoAlphAmount: 3n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,

    })


    // Check that event is emitted
    const { events } = await web3
      .getCurrentNodeProvider()
      .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(2)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))

    await factory.transact.mintPoapSerie({
      args: {
        eventId: 0n,
        collection: collection.contractId,
        amount: 0n,
        password: ''
      },
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

    let collectionState = await collection.fetchState()
    let poapNft = PoapNFTSerieV2.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 0n } })).returns))
    let poapNftState = await poapNft.fetchState()

    expect((await collection.view.totalSupply()).returns).toBe(1n)
    expect(poapNftState.fields.lockedUntil).toEqual(now + 86400n * 1000n)

    const nftId = (await collection.view.nftByIndex({ args: { index: 0n } })).returns

    const poapBalance = await balanceOf(minter.address, nftId)

    expect(poapBalance.amount).toBe("1")

    const builder = TransactionBuilder.from(web3
      .getCurrentNodeProvider())

    expect(builder.buildTransferTx(
      {
        signerAddress: minter.address,
        destinations: [{
          address: minter2.address,
          attoAlphAmount: DUST_AMOUNT,
          tokens: [{
            id: nftId,
            amount: 1n,
          }],
        }],

      },
      minter.publicKey
    )).rejects.toThrowError('Not enough balance')


    // get Poap    
    const poap = PoapNFTSerieV2.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 0n } })).returns))
    const poapState = await poap.fetchState()
    expect(hexToString(poapState.fields.eventName)).toBe('Serie 1')

    expect((await poap.view.getTraits()).returns.length).toBe(9)

    expect(hexToString((await poap.view.getTokenUri()).returns)).toBe(`data:application/json,{\"name\": \"Serie 1\",\"image\": \"https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ\", \"attributes\": [{\"trait_type\": \"Event Name\", \"value\": \"Serie 1\"}, {\"trait_type\": \"Description\", \"value\": \"First serie\"}, {\"trait_type\": \"Organizer\", \"value\": \"00bee85f379545a2ed9f6cceb331288842f378cf0f04012ad4ac8824aae7d6f80a\"}, {\"trait_type\": \"Location\", \"value\": \"Devnet\"}, {\"trait_type\": \"Event Start At\", \"value\": 0}, {\"trait_type\": \"Event End At\", \"value\": 0},{\"trait_type\": \"Has Particpated\", \"value\": false}, {\"trait_type\": \"Locked Until\", \"value\": ${now + 86400n * 1000n}}]}`)

  }, 20000)

  it('Mint poap more than supply', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactoryV2)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

await NewPresenceNewEvent.execute({
  signer,
  initialFields: {
    factory: factory.contractId,
    eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
    eventName: stringToHex("Test 1"),
    description: stringToHex("Test Description"),
    isPublic: false,
    maxSupply: 1n,
    mintStartAt: 1735823531000n,
    mintEndAt: 1893595576000n,
    poapPrice: 0n,
    tokenIdPoap: ALPH_TOKEN_ID,
    isOpenPrice: false,
    tokenIdAirdrop: ALPH_TOKEN_ID,
    amountAirdropPerUser: 0n,
    amountAirdrop: 0n,
    airdropWhenHasParticipated: false,
    image: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
    name: stringToHex("Serie 1"),
    eventDescription: stringToHex("First serie"),
    location: stringToHex("Devnet"),
    eventStartAt: 0n,
    eventEndAt: 0n,
    eventIsPublic: false,
    isBurnable: false,
    lockedUntil: 0n,
    hashedPassword: "00",
    amountForStorageFees: 0n,
    amountForChainFees: 0n
  },
      attoAlphAmount: 3n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,

    })


    // Check that event is emitted
    const { events } = await web3
      .getCurrentNodeProvider()
      .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(2)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))

    await factory.transact.mintPoapSerie({
      args: {
        eventId: 0n,
        collection: collection.contractId,
        amount: 0n,
        password: ''
      },
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })


    expect((await collection.view.totalSupply()).returns).toBe(1n)

    await expectAssertionError(factory.transact.mintPoapSerie({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        amount: 0n,
        password: '',
        eventId: 0n,
        collection: collection.contractId
      }
    }), addressFromContractId(poapCollectionMinted), 3)

  }, 20000)


    it('Mint poap and burn it', async () => {
      const signer = await testNodeWallet()
      const deployments = await deployToDevnet()
      const factory = deployments.getInstance(PoapFactoryV2)
  
      expect(factory).toBeDefined()
  
      if (!factory) {
        throw new Error('Factory is undefined')
      }
  

      await NewPresenceNewEvent.execute({
        signer,
      initialFields: {
        factory: factory.contractId,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false,
        maxSupply: 1n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        isOpenPrice: false,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false,
        image: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        name: stringToHex("Serie 1"),
        eventDescription: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        eventIsPublic: false,
        isBurnable: true,
        lockedUntil: 0n,
        hashedPassword: "00",
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      attoAlphAmount: 3n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,

    })

     
      // Check that event is emitted
      const { events } = await web3
        .getCurrentNodeProvider()
        .events.getEventsContractContractaddress(factory.address, { start: 0 })
      expect(events.length).toEqual(2)
  
      const creationEvent = events[0]
      const poapCollectionMinted = creationEvent.fields[0].value as string
  
      const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))
  
      await factory.transact.mintPoapSerie({
        signer: minter,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
        args: {
          collection: collection.contractId,
          amount: 0n,
          password: '',
          eventId: 0n
        }
      })
  
      expect((await collection.view.totalSupply()).returns).toBe(1n)
  
  
      // get Poap    
      const poap = PoapNFTSerieV2.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 0n } })).returns))
      await poap.transact.burn({
        signer: minter,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
      })
  
    }, 20000)


    it('Mint poap, set price ALPH', async () => {
          web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch)

    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactoryV2)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

    await NewPresenceNewEvent.execute({
      signer,
      initialFields: {
        factory: factory.contractId,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false,
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        poapPrice: ONE_ALPH,
        tokenIdPoap: ALPH_TOKEN_ID,
        isOpenPrice: false,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false,
        image: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        name: stringToHex("Serie 1"),
        eventDescription: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        eventIsPublic: false,
        isBurnable: true,
        lockedUntil: 0n,
        hashedPassword: "00",
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      attoAlphAmount: 3n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,

    })

    

    // Check that event is emitted
    const { events } = await web3
      .getCurrentNodeProvider()
      .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(2)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))

    await factory.transact.mintPoapSerie({
      signer: minter,
      attoAlphAmount: ONE_ALPH + MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        eventId: 0n,
        collection: collection.contractId,
        amount: ONE_ALPH,
        password: ''
      }
    })

    const poapDataAddress = addressFromContractId((await collection.view.getPoapDataByEvent({ args: { eventId: 0n } })).returns)
    const poapData = PoapData.at(poapDataAddress)
    
    expect((await collection.view.totalSupply()).returns).toBe(1n)
    expect((await alphBalanceOf(collection.address))).toBe(MINIMAL_CONTRACT_DEPOSIT)
    expect((await alphBalanceOf(poapDataAddress))).toBe(ONE_ALPH + MINIMAL_CONTRACT_DEPOSIT)
    expect((await poapData.view.getAmountPoapFees()).returns).toBe(ONE_ALPH)

    await collection.transact.claimFunds({
      args: {
        eventId: 0n,
        amountToClaim: ONE_ALPH
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: signer
    })

    expect((await alphBalanceOf(collection.address))).toBe(MINIMAL_CONTRACT_DEPOSIT)

    await expectAssertionError(collection.transact.claimFunds({
      args: {
        eventId: 0n,
        amountToClaim: 100n
      },
      signer: minter
    }), addressFromContractId(collection.contractId), 7)


  }, 20000)

    it('Mint poap, set price custom token', async () => {
      const signer = await testNodeWallet()
      const deployments = await deployToDevnet()
      const factory = deployments.getInstance(PoapFactoryV2)
  
      expect(factory).toBeDefined()
  
  
      if (!factory) {
        throw new Error('Factory is undefined')
      }
  
      const customTokenA = await mintToken((await signer.getSelectedAccount()).address, 200n)
  
      await NewPresenceNewEvent.execute({
      signer,
      initialFields: {
        factory: factory.contractId,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false,
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        poapPrice: 1n,
        tokenIdPoap: customTokenA.contractId,
        isOpenPrice: false,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false,
        image: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        name: stringToHex("Serie 1"),
        eventDescription: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        eventIsPublic: false,
        isBurnable: true,
        lockedUntil: 0n,
        hashedPassword: "00",
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      attoAlphAmount: 3n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,

    })
  
      // Check that event is emitted
      const { events } = await web3
        .getCurrentNodeProvider()
        .events.getEventsContractContractaddress(factory.address, { start: 0 })
      expect(events.length).toEqual(2)
  
      const creationEvent = events[0]
      const poapCollectionMinted = creationEvent.fields[0].value as string
  
      const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))
  
      await transferTokenTo(minter.address, customTokenA.contractId, 2n)
  
      await factory.transact.mintPoapSerie({
        signer: minter,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
        tokens: [{
          id: customTokenA.contractId,
          amount: 1n
        }],
        args: {
          collection: collection.contractId,
          amount: 0n,
          password: '',
          eventId: 0n
        }
      })
  
      await factory.transact.mintPoapSerie({
        signer: minter,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
        tokens: [{
          id: customTokenA.contractId,
          amount: 1n
        }],
        args: {
          collection: collection.contractId,
          amount: 0n,
          password: '',
          eventId: 0n
        }
      })
      
      const poapDataAddress = addressFromContractId((await collection.view.getPoapDataByEvent({ args: { eventId: 0n } })).returns)

      expect((await collection.view.totalSupply()).returns).toBe(2n)
      expect((await alphBalanceOf(collection.address))).toBe(MINIMAL_CONTRACT_DEPOSIT)
      expect((await balanceOf(poapDataAddress, customTokenA.contractId)).amount).toBe("2")
  
  
      await expect(factory.transact.mintPoapSerie({
        signer: minter,
        attoAlphAmount: ONE_ALPH + MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
        tokens: [{
          id: customTokenA.contractId,
          amount: 1n
        }],
        args: {
          collection: collection.contractId,
          amount: 0n,
          password: '',
          eventId: 0n
        }
      })).rejects.toThrowError()
  
      expect(number256ToBigint((await balanceOf(poapDataAddress, customTokenA.contractId)).amount)).toBe(2n)
  
      await collection.transact.claimFunds({
        args: {
          amountToClaim: 1n,
          eventId: 0n
        },
        attoAlphAmount: DUST_AMOUNT,
        signer: signer
      })
  
      expectAssertionError(collection.transact.claimFunds({
        args: {
          amountToClaim: 1n,
          eventId: 0n
        },
        attoAlphAmount: DUST_AMOUNT,
        signer: minter
      }), collection.address, 7)
  
      expect(number256ToBigint((await balanceOf(poapDataAddress, customTokenA.contractId)).amount)).toBe(1n)
  
      await collection.transact.claimFunds({
        args: {
          amountToClaim: 1n,
          eventId: 0n
        },
        attoAlphAmount: DUST_AMOUNT,
        signer: signer
      })
  
      expect(number256ToBigint((await balanceOf(poapDataAddress, customTokenA.contractId)).amount)).toBe(0n)
  
  
    }, 20000)


     it('Mint poap, set airdrop with custom token', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactoryV2)

    expect(factory).toBeDefined()


    if (!factory) {
      throw new Error('Factory is undefined')
    }

    const customTokenA = await mintToken((await signer.getSelectedAccount()).address, 200n)

    await NewPresenceNewEvent.execute({
      signer,
      initialFields: {
        factory: factory.contractId,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false,
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        isOpenPrice: false,
        tokenIdAirdrop: customTokenA.contractId,
        amountAirdropPerUser: 10n,
        amountAirdrop: 20n,
        airdropWhenHasParticipated: false,
        image: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        name: stringToHex("Serie 1"),
        eventDescription: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        eventIsPublic: false,
        isBurnable: true,
        lockedUntil: 0n,
        hashedPassword: "00",
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      attoAlphAmount: 3n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      tokens: [{
        id: customTokenA.tokenId,
        amount: 20n
      }]

    })

    // Check that event is emitted
    const { events } = await web3
      .getCurrentNodeProvider()
      .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(2)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string


    const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))
    const poapDataAddress = addressFromContractId((await collection.view.getPoapDataByEvent({ args: { eventId: 0n } })).returns)

    expect(number256ToBigint((await balanceOf(poapDataAddress, customTokenA.contractId)).amount)).toBe(20n)


    await factory.transact.mintPoapSerie({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n * DUST_AMOUNT,
      args: {
        collection: collection.contractId,
        amount: 0n,
        password: '',
        eventId: 0n
      }
    })


    expect(number256ToBigint((await balanceOf(minter.account.address, customTokenA.tokenId)).amount)).toBe(10n)

    expect(number256ToBigint((await balanceOf(poapDataAddress, customTokenA.contractId)).amount)).toBe(10n)


    await factory.transact.mintPoapSerie({
      signer: minter2,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n * DUST_AMOUNT,
      args: {
        collection: collection.contractId,
        amount: 0n,
        password: '',
        eventId: 0n
      }
    })
    expect(number256ToBigint((await balanceOf(minter2.account.address, customTokenA.tokenId)).amount)).toBe(10n)


    expect((await collection.view.totalSupply()).returns).toBe(2n)
    expect((await alphBalanceOf(collection.address))).toBe(MINIMAL_CONTRACT_DEPOSIT)
    expect(number256ToBigint((await balanceOf(poapDataAddress, customTokenA.tokenId)).amount)).toBe(0n)

    await factory.transact.mintPoapSerie({
      signer: minter3,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        collection: collection.contractId,
        amount: 0n,
        password: '',
        eventId: 0n
      }
    })
    expect(number256ToBigint((await balanceOf(minter3.account.address, customTokenA.tokenId)).amount)).toBe(0n)



  }, 20000)


    it('Mint poap, set open price alph', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactoryV2)

    expect(factory).toBeDefined()


    if (!factory) {
      throw new Error('Factory is undefined')
    }

    const customTokenA = await mintToken((await signer.getSelectedAccount()).address, 200n)

    await NewPresenceNewEvent.execute({
      signer,
      initialFields: {
        factory: factory.contractId,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false,
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        isOpenPrice: true,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false,
        image: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        name: stringToHex("Serie 1"),
        eventDescription: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        eventIsPublic: false,
        isBurnable: true,
        lockedUntil: 0n,
        hashedPassword: "00",
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      attoAlphAmount: 3n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,


    })



    // Check that event is emitted
    const { events } = await web3
    .getCurrentNodeProvider()
    .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(2)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))
    const poapDataAddress = addressFromContractId((await collection.view.getPoapDataByEvent({ args: { eventId: 0n } })).returns)

    await factory.transact.mintPoapSerie({
      signer: minter,
      attoAlphAmount: 2n*ONE_ALPH + MINIMAL_CONTRACT_DEPOSIT + 2n * DUST_AMOUNT,

      args: {
        collection: collection.contractId,
        amount: 2n * ONE_ALPH,
        password: '',
        eventId: 0n
      }
    })

    await factory.transact.mintPoapSerie({
      signer: minter,
      attoAlphAmount: 2n*ONE_ALPH + MINIMAL_CONTRACT_DEPOSIT + 2n * DUST_AMOUNT,
      args: {
        collection: collection.contractId,
        amount: 2n * ONE_ALPH,
        password: '',
        eventId: 0n
      }
    })

    expect((await collection.view.totalSupply()).returns).toBe(2n)
    expect((await alphBalanceOf(poapDataAddress))).toBe(4n*ONE_ALPH + MINIMAL_CONTRACT_DEPOSIT)
    

    await expect(factory.transact.mintPoapSerie({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n * DUST_AMOUNT,
      args: {
        collection: collection.contractId,
        amount: 1n,
        password: '',
        eventId: 0n
      }
    })).rejects.toThrowError()

    expect((await alphBalanceOf(poapDataAddress))).toBe(4n*ONE_ALPH + MINIMAL_CONTRACT_DEPOSIT)
    expect((await PoapData.at(poapDataAddress).view.getAmountPoapFees()).returns).toBe(4n* ONE_ALPH)

    await collection.transact.claimFunds({
      args: {
        amountToClaim: 2n * ONE_ALPH,
        eventId: 0n
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: signer
    })

    expectAssertionError(collection.transact.claimFunds({
      args: {
        amountToClaim: 1n * ONE_ALPH,
        eventId: 0n
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: minter
    }), collection.address, 7)

    
    expect((await alphBalanceOf(poapDataAddress))).toBe(2n*ONE_ALPH + MINIMAL_CONTRACT_DEPOSIT)
    expect((await PoapData.at(poapDataAddress).view.getAmountPoapFees()).returns).toBe(2n* ONE_ALPH)

    await collection.transact.claimFunds({
      args: {
        amountToClaim: 2n * ONE_ALPH,
        eventId: 0n
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: signer
    })

  

    expect((await alphBalanceOf(poapDataAddress))).toBe(MINIMAL_CONTRACT_DEPOSIT)
    expect((await PoapData.at(poapDataAddress).view.getAmountPoapFees()).returns).toBe(0n)


  }, 20000)

    it('Mint poap, set open price custom token', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactoryV2)

    expect(factory).toBeDefined()


    if (!factory) {
      throw new Error('Factory is undefined')
    }

    const customTokenA = await mintToken((await signer.getSelectedAccount()).address, 200n)

    await NewPresenceNewEvent.execute({
      signer,
      initialFields: {
        factory: factory.contractId,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false,
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        poapPrice: 0n,
        tokenIdPoap: customTokenA.contractId,
        isOpenPrice: true,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false,
        image: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        name: stringToHex("Serie 1"),
        eventDescription: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        eventIsPublic: false,
        isBurnable: true,
        lockedUntil: 0n,
        hashedPassword: "00",
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      attoAlphAmount: 3n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,


    })



    // Check that event is emitted
    const { events } = await web3
    .getCurrentNodeProvider()
    .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(2)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))
    const poapDataAddress = addressFromContractId((await collection.view.getPoapDataByEvent({ args: { eventId: 0n } })).returns)

    await transferTokenTo(minter.address, customTokenA.contractId, 2n)

    await factory.transact.mintPoapSerie({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n * DUST_AMOUNT,
      tokens: [{
        id: customTokenA.contractId,
        amount: 1n
      }],
      args: {
        collection: collection.contractId,
        amount: 1n,
        password: '',
        eventId: 0n
      }
    })

    await factory.transact.mintPoapSerie({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + 2n * DUST_AMOUNT,
      tokens: [{
        id: customTokenA.contractId,
        amount: 1n
      }],
      args: {
        collection: collection.contractId,
        amount: 1n,
        password: '',
        eventId: 0n
      }
    })

    expect((await collection.view.totalSupply()).returns).toBe(2n)
    expect((await alphBalanceOf(poapDataAddress))).toBe(MINIMAL_CONTRACT_DEPOSIT)
    expect((await balanceOf(poapDataAddress, customTokenA.contractId)).amount).toBe("2")


    await expect(factory.transact.mintPoapSerie({
      signer: minter,
      attoAlphAmount: ONE_ALPH + MINIMAL_CONTRACT_DEPOSIT + 2n * DUST_AMOUNT,
      tokens: [{
        id: customTokenA.contractId,
        amount: 1n
      }],
      args: {
        collection: collection.contractId,
        amount: 1n,
        password: '',
        eventId: 0n
      }
    })).rejects.toThrowError()

    expect(number256ToBigint((await balanceOf(poapDataAddress, customTokenA.contractId)).amount)).toBe(2n)

    await collection.transact.claimFunds({
      args: {
        amountToClaim: 1n,
        eventId: 0n
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: signer
    })

    expectAssertionError(collection.transact.claimFunds({
      args: {
        amountToClaim: 1n,
        eventId: 0n
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: minter
    }), collection.address, 7)

    expect(number256ToBigint((await balanceOf(poapDataAddress, customTokenA.contractId)).amount)).toBe(1n)

    await collection.transact.claimFunds({
      args: {
        amountToClaim: 1n,
        eventId: 0n
      },
      attoAlphAmount: DUST_AMOUNT,
      signer: signer
    })

    expect(number256ToBigint((await balanceOf(poapDataAddress, customTokenA.contractId)).amount)).toBe(0n)


  }, 20000)

 it('Mint poap trough Factory and set poap participated', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactoryV2)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }
    


     await NewPresenceNewEvent.execute({
      signer,
      initialFields: {
        factory: factory.contractId,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false,
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        isOpenPrice: false,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: false,
        image: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        name: stringToHex("Serie 1"),
        eventDescription: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        eventIsPublic: false,
        isBurnable: true,
        lockedUntil: 0n,
        hashedPassword: "00",
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      attoAlphAmount: 3n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,


    })


    // Check that event is emitted
    const { events } = await web3
      .getCurrentNodeProvider()
      .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(2)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))

    await factory.transact.mintPoapSerie({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        amount: 0n,
        password: '',
        eventId: 0n,
        collection: collection.contractId
      }
    })

    // get Poap    
    const poap = PoapNFTSerieV2.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 0n } })).returns))
    const poapDataAddress = addressFromContractId((await collection.view.getPoapDataByEvent({ args: { eventId: 0n } })).returns)

    let poapState = await poap.fetchState()
    expect(hexToString(poapState.fields.eventName)).toBe('Serie 1')
    expect((await poap.view.getTraits()).returns.length).toBe(9)
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

    const poapData = PoapData.at(poapDataAddress)
    await collection.transact.setParticipatedPresence({
      args: {
        nftIndex: 0n,
        eventId: 0n,

      },
      signer: signer,
      attoAlphAmount: 10n * DUST_AMOUNT
    })
    poapState = await poap.fetchState()

    expect(poapState.fields.hasParticipated).toBe(true)


    expect((await collection.view.totalSupply()).returns).toBe(1n)



    await factory.transact.mintPoapSerie({
      args: {
        collection: collection.contractId,
        amount: 0n,
        password: '',
        eventId: 0n
      },
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

    const poap2 = PoapNFTSerieV2.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 1n } })).returns))
    let poapState2 = await poap2.fetchState()
    expect(hexToString(poapState2.fields.eventName)).toBe('Serie 1')
    expect((await poap2.view.getTraits()).returns.length).toBe(9)
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
        eventId: 0n
      },
      signer: signer,
      attoAlphAmount: DUST_AMOUNT
    })

    poapState2 = await poap2.fetchState()
    expect(poapState2.fields.hasParticipated).toBe(true)


    expect((await collection.view.totalSupply()).returns).toBe(2n)

    await factory.transact.mintPoapSerie({
      args: {
        collection: collection.contractId,
        amount: 0n,
        password: '',
        eventId: 0n
      },
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

    expectAssertionError(
      collection.transact.setParticipatedPresence({
        args: {
          nftIndex: 2n,
          eventId: 0n
        },
        signer: minter,
        attoAlphAmount: DUST_AMOUNT
      })
      , collection.address, 7)

    const poap3 = PoapNFTSerieV2.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 1n } })).returns))
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
    const factory = deployments.getInstance(PoapFactoryV2)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

    const customTokenA = await mintToken((await signer.getSelectedAccount()).address, 200n)

await NewPresenceNewEvent.execute({
      signer,
      initialFields: {
        factory: factory.contractId,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false,
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        isOpenPrice: false,
        tokenIdAirdrop: customTokenA.tokenId,
        amountAirdropPerUser: 10n,
        amountAirdrop: 20n,
        airdropWhenHasParticipated: true,
        image: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        name: stringToHex("Serie 1"),
        eventDescription: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        eventIsPublic: false,
        isBurnable: true,
        lockedUntil: 0n,
        hashedPassword: "00",
        amountForStorageFees: 0n,
        amountForChainFees: 0n
      },
      attoAlphAmount:  3n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
            tokens: [{
        id: customTokenA.tokenId,
        amount: 20n
      }]


    })


    // Check that event is emitted
    const { events } = await web3
      .getCurrentNodeProvider()
      .events.getEventsContractContractaddress(factory.address, { start: 0 })
    expect(events.length).toEqual(2)

    const creationEvent = events[0]
    const poapCollectionMinted = creationEvent.fields[0].value as string

    const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))
    const poapDataAddress = addressFromContractId((await collection.view.getPoapDataByEvent({ args: { eventId: 0n } })).returns)

    await factory.transact.mintPoapSerie({
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
      args: {
        amount: 0n,
        password: '',
        collection: collection.contractId,
        eventId: 0n
      }
    })

    expect(number256ToBigint((await balanceOf(poapDataAddress, customTokenA.tokenId)).amount)).toBe(20n)
    expect(number256ToBigint((await alphBalanceOf(collection.address)))).toBe(MINIMAL_CONTRACT_DEPOSIT)
    expect(number256ToBigint((await alphBalanceOf(poapDataAddress)))).toBe(MINIMAL_CONTRACT_DEPOSIT)

    // get Poap    
    const poap = PoapNFTSerieV2.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 0n } })).returns))
    let poapState = await poap.fetchState()
    expect(hexToString(poapState.fields.eventName)).toBe('Serie 1')
    expect((await poap.view.getTraits()).returns.length).toBe(9)
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
        eventId: 0n,
      },
      signer: signer,
      attoAlphAmount: 3n * DUST_AMOUNT
    })
    poapState = await poap.fetchState()

    expect(poapState.fields.hasParticipated).toBe(true)
    expect(number256ToBigint((await balanceOf(minter.account.address, customTokenA.tokenId)).amount)).toBe(10n)

    expect((await collection.view.totalSupply()).returns).toBe(1n)



    await factory.transact.mintPoapSerie({
      args: {
        collection: collection.contractId,
        amount: 0n,
        password: '',
        eventId: 0n
      },
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })

    const poap2 = PoapNFTSerieV2.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 1n } })).returns))
    let poapState2 = await poap2.fetchState()
    expect(hexToString(poapState2.fields.eventName)).toBe('Serie 1')
    expect((await poap2.view.getTraits()).returns.length).toBe(9)
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
        eventId: 0n
      },
      signer: signer,
      attoAlphAmount: DUST_AMOUNT
    })

    poapState2 = await poap2.fetchState()
    expect(poapState2.fields.hasParticipated).toBe(true)
    expect(number256ToBigint((await balanceOf(minter.account.address, customTokenA.tokenId)).amount)).toBe(20n)


    expect((await collection.view.totalSupply()).returns).toBe(2n)

    await factory.transact.mintPoapSerie({
      args: {
        collection: collection.contractId,
        amount: 0n,
        password: '',
        eventId: 0n
      },
      signer: minter,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })
    expect(number256ToBigint((await balanceOf(minter.account.address, customTokenA.tokenId)).amount)).toBe(20n)


    expectAssertionError(
      collection.transact.setParticipatedPresence({
        args: {
          nftIndex: 2n,
          eventId: 0n
        },
        signer: minter,
        attoAlphAmount: DUST_AMOUNT
      })
      , collection.address, 7)

    const poap3 = PoapNFTSerieV2.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 1n } })).returns))
    expect(
      poap3.transact.setParticipated({
        signer: minter,
        attoAlphAmount: DUST_AMOUNT
      })
    ).rejects.toThrowError("ExpectAContract")


  }, 20000)

  

    it('Mint poap with Storage fees paid', async () => {
      const signer = await testNodeWallet()
      const deployments = await deployToDevnet()
      const factory = deployments.getInstance(PoapFactoryV2)
  
      expect(factory).toBeDefined()
  
      if (!factory) {
        throw new Error('Factory is undefined')
      }
  
      await NewPresenceNewEvent.execute({
      signer,
      initialFields: {
        factory: factory.contractId,
        eventImage: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        eventName: stringToHex("Test 1"),
        description: stringToHex("Test Description"),
        isPublic: false,
        maxSupply: 10n,
        mintStartAt: 1735823531000n,
        mintEndAt: 1893595576000n,
        poapPrice: 0n,
        tokenIdPoap: ALPH_TOKEN_ID,
        isOpenPrice: false,
        tokenIdAirdrop: ALPH_TOKEN_ID,
        amountAirdropPerUser: 0n,
        amountAirdrop: 0n,
        airdropWhenHasParticipated: true,
        image: stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
        name: stringToHex("Serie 1"),
        eventDescription: stringToHex("First serie"),
        location: stringToHex("Devnet"),
        eventStartAt: 0n,
        eventEndAt: 0n,
        eventIsPublic: false,
        isBurnable: true,
        lockedUntil: 0n,
        hashedPassword: "00",
        amountForStorageFees: 2n * 10n ** 17n,
        amountForChainFees: 10n * ONE_ALPH
      },
      attoAlphAmount: 3n*MINIMAL_CONTRACT_DEPOSIT + 2n * 10n ** 17n + DUST_AMOUNT + 10n * ONE_ALPH

    })

      
      // Check that event is emitted
      const { events } = await web3
        .getCurrentNodeProvider()
        .events.getEventsContractContractaddress(factory.address, { start: 0 })
      expect(events.length).toEqual(2)
  
      const creationEvent = events[0]
      const poapCollectionMinted = creationEvent.fields[0].value as string
  
  
  
      const collection = PoapSerieCollectionV2.at(addressFromContractId(poapCollectionMinted))
      const poapDataAddress = addressFromContractId((await collection.view.getPoapDataByEvent({ args: { eventId: 0n } })).returns)
      const poapData = PoapData.at(poapDataAddress)

      let collectionState = await collection.fetchState()
      let poapDataState = await poapData.fetchState()
      console.log(poapDataState.fields.amountForStorageFees,poapDataState.fields.amountForChainFees, await alphBalanceOf(poapDataAddress))
      console.log((await poapData.view.getAmountForStorageFees()).returns,  (await poapData.view.getAmountForChainFees()).returns)

      expect((await alphBalanceOf(poapDataAddress))).toEqual(poapDataState.fields.amountForStorageFees + MINIMAL_CONTRACT_DEPOSIT + poapDataState.fields.amountForChainFees)
      //expect((await alphBalanceOf(poapDataAddress))).toEqual(3n * 10n ** 17n + 10n * ONE_ALPH)

      console.log(`caller ${minter.address}`)
      await factory.transact.mintPoapSerie({
        signer: minter,
        attoAlphAmount: DUST_AMOUNT + MINIMAL_CONTRACT_DEPOSIT,
        args: {
          amount: 0n,
          password: '',
          collection: collection.contractId,
          eventId: 0n
        }
      })
  
      collectionState = await collection.fetchState()
      //expect((await alphBalanceOf(collection.address))).toEqual(collectionState.fields.amountForStorageFees + MINIMAL_CONTRACT_DEPOSIT)
      expect((await alphBalanceOf(collection.address))).toEqual(2n*10n**17n)
  
      expect((await collection.view.totalSupply()).returns).toBe(1n)
  
      await factory.transact.mintPoapSerie({
        signer: minter,
        attoAlphAmount: 0n,
        args: {
          amount: 0n,
          password: '',
          collection: collection.contractId,
          eventId: 0n
        }
      })
  
      collectionState = await collection.fetchState()
      poapDataState = await poapData.fetchState()
      expect(poapDataState.fields.amountForStorageFees).toEqual(0n) //the storage fees for the collection contract
      //expect((await alphBalanceOf(collection.address))).toEqual(MINIMAL_CONTRACT_DEPOSIT)
  
      // contract is empty, user need to pay for storage
      await factory.transact.mintPoapSerie({
        signer: minter2,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT,
        args: {
          collection: collection.contractId,
          eventId: 0n,
          amount: 0n,
          password: ''
        }
      })
  
      // should failed because there's no ALPH left in the sc to pay the storage fees
      await factory.transact.mintPoapSerie({
        signer: minter2,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT,
        args: {
          amount: 0n,
          password: '',
          collection: collection.contractId,
          eventId: 0n
        }
      })
  
      // get Poap    
      const poap = PoapNFTSerieV2.at(addressFromContractId((await collection.view.nftByIndex({ args: { index: 0n } })).returns))
      const poapState = await poap.fetchState()
      expect(hexToString(poapState.fields.eventName)).toBe('Serie 1')
  
      expect((await poap.view.getTraits()).returns.length).toBe(9)
  
    }, 20000)


})
