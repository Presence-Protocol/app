import { addressFromContractId, ALPH_TOKEN_ID, DUST_AMOUNT, hexToString, MINIMAL_CONTRACT_DEPOSIT, ONE_ALPH, stringToHex, web3 } from "@alephium/web3"
import { PrivateKeyWallet } from "@alephium/web3-wallet"
import { getRandomSigner, transferAlphTo } from "../utils"
import { deployToDevnet } from "@alephium/cli"
import { testNodeWallet } from "@alephium/web3-test"
import { PoapFactoryV2, PoapSerieCollectionV2 } from "../../artifacts/ts"
import { sign } from "crypto"
import { col } from "sequelize"

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

    it('deploy collection', async () => {
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
                eventImage:stringToHex('https://arweave.net/hoxK8xC9wRjD_6HiOzhdY2jW0ZnJoF2f0N4FcSLXqzQ'),
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
            attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT + DUST_AMOUNT
        })


    })

})