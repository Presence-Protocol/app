# Presence protocol

Presence Protocol is built on the foundation of Presence (Proof of Attendance Protocol), designed to leverage the power of the Alephium blockchain to provide verifiable proof of event attendance, known as a Presence.

When an event is organized, the organizer can create a unique event on the blockchain. Participants who attend the event can then mint a Presence as a digital proof of their participation. This not only secures attendance records on a scalable, secure blockchain but also opens the door to new ways of engaging communities and rewarding event participation.

**Highlights:**

- **Intuitive & Sleek UI** Designed for a seamless user experience.  
- **Public Event Explorer** Browse all publicly listed events with ease.  
- **User Activity Tracking** View events attended and organized by any *Presencer*.  
- **Premium Event Access** Unlock exclusive events using ALPH or other supported tokens.  
- **Delegated Payments** Option to pay on behalf of users for added convenience.  
- **Claim Windows** Events can only be claimed within a specific time frame, ensuring timely participation.  
- **One Presence Per Address** Enforces unique participation to maintain event integrity.  
- **NFT Integration** Supported by leading platforms like *Deadrare* and *Alphaga* for collectible rewards and badges.  

## Workflows 

![](./docs/workflows.png)

## Contracts fields

### PoapFactory

| Name                 | Type    | Description                         |
|----------------------|---------|-------------------------------------|
| collectionTemplateId | ByteVec | contract template id for collection |
| poapTemplateId       | ByteVec | contract template id for Presence       |
| numMintedCollection  | U256    | how many events has been created    |

### PoapCollection

| Name          | Type    | Description                                                  |
|---------------|---------|--------------------------------------------------------------|
| nftTemplateId | ByteVec | Contract template id for Presence                                |
| maxSupply     | U256    | How many Presence can be minted                                  |
| mintStartAt   | U256    | When mint can start                                          |
| mintEndAt    | U256    | When mint will stop                                          |
| oneMintPerAddress | Bool | allow only one mint per address |
| poapPrice | U256 | Price to mint a Presence |
| tokenIdPoap | U256 | tokenId to use if price is set |
| eventImage | ByteVec | Image URI or embedded image (< 2 KB) |
| eventName     | ByteVec | Name of the event                                            |
| description   | ByteVec | Description of the event                                     |
| organizer     | ByteVec | Address of the organizer converted to hex string , i.e creator of the event          |
| location      | ByteVec | Where the event is taking place                              |
| eventStartAt  | U256    | When the event starts                                        |
| eventEndAt    | U256    | When the event ends                                          |
| amountForStorageFees | U256 | total amount of ALPH stored in the contract to pay storage fees on user's behalf |
| amountPoapFees | U256 | amount paid by the users when PoapPrice is set |
| totalSupply | U256 | supply minted |


### Presence

| Name         | Type    | Description                                                  |
|--------------|---------|--------------------------------------------------------------|
| collectionId | ByteVec | Collection id contract where the NFT is generated from       |
| nftIndex     | ByteVec | Index of the NFT, nft id                                     |
| eventImage     | ByteVec | URI where the image is stored (ex: image)            |
| eventName    | ByteVec | Name of the event                                            |
| description  | ByteVec | Description of the event                                     |
| organizer    | ByteVec | Address of the organizer converted to hex string , i.e creator of the event           |
| location     | ByteVec | Where the event is taking place                              |
| eventStartAt | U256    | When the event starts                                        |
| eventEndAt   | U256    | When the event ends                                          |
| isPublic | Bool | Public event will show on Explorer |
| minter | Address | first address to have mint the Presence |
| isBurnable | Bool | does the Presence can be burned |


## Metadata format

Based on [IDynamicNFT](https://github.com/Deadrare/ANS/blob/main/contract/contracts/dynamic_nft/dynamic_nft_standard.ral)

```
Trait {
    traitType: b`Event Name`,
    value: eventName
},
Trait {
    traitType: b`Description`,
    value: description
},
Trait {
    traitType: b`Organizer`,
    value: toByteVec!(organizer)
},
Trait {
    traitType: b`Location`,
    value: location
},
Trait {
    traitType: b`Event Start At`,
    value: u256ToString!(eventStartAt)
},
Trait {
    traitType: b`Event End At`,
    value: u256ToString!(eventEndAt)
},
Trait {
    traitType: b`Public Event`,
    value: toByteVec!(isPublic)
}
```

To be able to show the Presence on NFT platforms, explorer and wallets, the organizer needs to add a json file following the NFT format the chain is using.

### Collection

collectionImageUri should receive an URL pointing to the image resource.

### Presence

nftImageUri should receive an URL pointing to the image resource.
