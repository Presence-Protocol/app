import { addressFromContractId, ALPH_TOKEN_ID, DUST_AMOUNT, hexToString, MINIMAL_CONTRACT_DEPOSIT, ONE_ALPH, stringToHex, web3 } from "@alephium/web3"
import { PrivateKeyWallet } from "@alephium/web3-wallet"
import { getRandomSigner, transferAlphTo } from "../utils"
import { deployToDevnet } from "@alephium/cli"
import { expectAssertionError, testNodeWallet } from "@alephium/web3-test"
import { NewPresenceNewEvent, PoapFactoryV2, PoapSerieCollectionV2 } from "../../artifacts/ts"
import { sign } from "crypto"


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
        amountAirdrop: 0n
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


    await NewPresenceNewEvent.execute(signer, {
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
        amountAirdrop: 0n
      },
      attoAlphAmount: 3n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })




  })


  it('deploy serie collection and new event with txscript and mint one', async () => {
    const signer = await testNodeWallet()
    const deployments = await deployToDevnet()
    const factory = deployments.getInstance(PoapFactoryV2)

    expect(factory).toBeDefined()

    if (!factory) {
      throw new Error('Factory is undefined')
    }

    let now = BigInt(Date.now())

    await NewPresenceNewEvent.execute(signer, {
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
        amountAirdrop: 0n
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
      signer: signer,
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
    })


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
          amountAirdrop: 0n
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
          airdropWhenHasParticipated: false,
          amountForChainFees: 0n,
          isOpenPrice: false,
          hashedPassword: '00',
          lockPresenceUntil: 0n
        },
        signer: signer,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
      })

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
          amountAirdrop: 0n
        },
        signer: signer,
        attoAlphAmount: 2n * MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
      })

      // Check that event is emitted
      const { events } = await web3
        .getCurrentNodeProvider()
        .events.getEventsContractContractaddress(factory.address, { start: 0 })
      expect(events.length).toEqual(1)

      const creationEvent = events[0]
      const poapCollectionMinted = creationEvent.fields[0].value as string

      const collection = PoapCollectionV2.at(addressFromContractId(poapCollectionMinted))

      await expectAssertionError(collection.transact.mint({
        signer: minter,
        attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT,
        args: {
          amount: 0n,
          password: ''
        }
      }), addressFromContractId(poapCollectionMinted), 4)

    }, 20000)


  })



})