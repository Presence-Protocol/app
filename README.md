# Presence protocol

## Metadata format

Based on `IDynamicNFT`

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
}
```

To be able to show the POAP on NFT platforms, explorer and wallets, the organizer needs to add a json file following the NFT format the chain is using.

### Collection
```json
{
  "name": "Alephium meetup",
  "description": "One of the many",
  "image": "<image file>"
}
```



### POAP

```json
{
  "name": "Alephium meetup",
  "image": "<image file>"
}
```