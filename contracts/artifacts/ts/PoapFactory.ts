/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Address,
  Contract,
  ContractState,
  TestContractResult,
  HexString,
  ContractFactory,
  EventSubscribeOptions,
  EventSubscription,
  CallContractParams,
  CallContractResult,
  TestContractParams,
  ContractEvent,
  subscribeContractEvent,
  subscribeContractEvents,
  testMethod,
  callMethod,
  multicallMethods,
  fetchContractState,
  Asset,
  ContractInstance,
  getContractEventsCurrentCount,
  TestContractParamsWithoutMaps,
  TestContractResultWithoutMaps,
  SignExecuteContractMethodParams,
  SignExecuteScriptTxResult,
  signExecuteMethod,
  addStdIdToFields,
  encodeContractFields,
  Narrow,
} from "@alephium/web3";
import { default as PoapFactoryContractJson } from "../PoapFactory.ral.json";
import { getContractByCodeHash, registerContract } from "./contracts";
import { Trait, AllStructs } from "./types";

// Custom types for the contract
export namespace PoapFactoryTypes {
  export type Fields = {
    collectionTemplateId: HexString;
    poapTemplateId: HexString;
    poapTemplateImageId: HexString;
    numMintedCollection: bigint;
  };

  export type State = ContractState<Fields>;

  export type EventCreatedEvent = ContractEvent<{
    contractId: HexString;
    eventName: HexString;
    organizer: Address;
  }>;
  export type PoapMintedEvent = ContractEvent<{
    contractId: HexString;
    collectionId: HexString;
    nftIndex: bigint;
    caller: Address;
  }>;

  export interface CallMethodTable {
    mintNewCollection: {
      params: CallContractParams<{
        collectionUri: HexString;
        nftUri: HexString;
        imageSvg: HexString;
        maxSupply: bigint;
        mintStartAt: bigint;
        mintEndAt: bigint;
        eventName: HexString;
        description: HexString;
        organizer: Address;
        location: HexString;
        eventStartAt: bigint;
        eventEndAt: bigint;
        totalSupply: bigint;
      }>;
      result: CallContractResult<HexString>;
    };
    mintPoap: {
      params: CallContractParams<{ collection: HexString }>;
      result: CallContractResult<null>;
    };
  }
  export type CallMethodParams<T extends keyof CallMethodTable> =
    CallMethodTable[T]["params"];
  export type CallMethodResult<T extends keyof CallMethodTable> =
    CallMethodTable[T]["result"];
  export type MultiCallParams = Partial<{
    [Name in keyof CallMethodTable]: CallMethodTable[Name]["params"];
  }>;
  export type MultiCallResults<T extends MultiCallParams> = {
    [MaybeName in keyof T]: MaybeName extends keyof CallMethodTable
      ? CallMethodTable[MaybeName]["result"]
      : undefined;
  };
  export type MulticallReturnType<Callss extends MultiCallParams[]> = {
    [index in keyof Callss]: MultiCallResults<Callss[index]>;
  };

  export interface SignExecuteMethodTable {
    mintNewCollection: {
      params: SignExecuteContractMethodParams<{
        collectionUri: HexString;
        nftUri: HexString;
        imageSvg: HexString;
        maxSupply: bigint;
        mintStartAt: bigint;
        mintEndAt: bigint;
        eventName: HexString;
        description: HexString;
        organizer: Address;
        location: HexString;
        eventStartAt: bigint;
        eventEndAt: bigint;
        totalSupply: bigint;
      }>;
      result: SignExecuteScriptTxResult;
    };
    mintPoap: {
      params: SignExecuteContractMethodParams<{ collection: HexString }>;
      result: SignExecuteScriptTxResult;
    };
  }
  export type SignExecuteMethodParams<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["params"];
  export type SignExecuteMethodResult<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["result"];
}

class Factory extends ContractFactory<
  PoapFactoryInstance,
  PoapFactoryTypes.Fields
> {
  encodeFields(fields: PoapFactoryTypes.Fields) {
    return encodeContractFields(
      addStdIdToFields(this.contract, fields),
      this.contract.fieldsSig,
      AllStructs
    );
  }

  eventIndex = { EventCreated: 0, PoapMinted: 1 };

  at(address: string): PoapFactoryInstance {
    return new PoapFactoryInstance(address);
  }

  tests = {
    mintNewCollection: async (
      params: TestContractParamsWithoutMaps<
        PoapFactoryTypes.Fields,
        {
          collectionUri: HexString;
          nftUri: HexString;
          imageSvg: HexString;
          maxSupply: bigint;
          mintStartAt: bigint;
          mintEndAt: bigint;
          eventName: HexString;
          description: HexString;
          organizer: Address;
          location: HexString;
          eventStartAt: bigint;
          eventEndAt: bigint;
          totalSupply: bigint;
        }
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(
        this,
        "mintNewCollection",
        params,
        getContractByCodeHash
      );
    },
    mintPoap: async (
      params: TestContractParamsWithoutMaps<
        PoapFactoryTypes.Fields,
        { collection: HexString }
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "mintPoap", params, getContractByCodeHash);
    },
  };

  stateForTest(
    initFields: PoapFactoryTypes.Fields,
    asset?: Asset,
    address?: string
  ) {
    return this.stateForTest_(initFields, asset, address, undefined);
  }
}

// Use this object to test and deploy the contract
export const PoapFactory = new Factory(
  Contract.fromJson(
    PoapFactoryContractJson,
    "",
    "e2c2dcd6bd0bfff2eabac055b456ad8384e85b4d9037d58f92c8437566466282",
    AllStructs
  )
);
registerContract(PoapFactory);

// Use this class to interact with the blockchain
export class PoapFactoryInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<PoapFactoryTypes.State> {
    return fetchContractState(PoapFactory, this);
  }

  async getContractEventsCurrentCount(): Promise<number> {
    return getContractEventsCurrentCount(this.address);
  }

  subscribeEventCreatedEvent(
    options: EventSubscribeOptions<PoapFactoryTypes.EventCreatedEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      PoapFactory.contract,
      this,
      options,
      "EventCreated",
      fromCount
    );
  }

  subscribePoapMintedEvent(
    options: EventSubscribeOptions<PoapFactoryTypes.PoapMintedEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      PoapFactory.contract,
      this,
      options,
      "PoapMinted",
      fromCount
    );
  }

  subscribeAllEvents(
    options: EventSubscribeOptions<
      PoapFactoryTypes.EventCreatedEvent | PoapFactoryTypes.PoapMintedEvent
    >,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvents(
      PoapFactory.contract,
      this,
      options,
      fromCount
    );
  }

  view = {
    mintNewCollection: async (
      params: PoapFactoryTypes.CallMethodParams<"mintNewCollection">
    ): Promise<PoapFactoryTypes.CallMethodResult<"mintNewCollection">> => {
      return callMethod(
        PoapFactory,
        this,
        "mintNewCollection",
        params,
        getContractByCodeHash
      );
    },
    mintPoap: async (
      params: PoapFactoryTypes.CallMethodParams<"mintPoap">
    ): Promise<PoapFactoryTypes.CallMethodResult<"mintPoap">> => {
      return callMethod(
        PoapFactory,
        this,
        "mintPoap",
        params,
        getContractByCodeHash
      );
    },
  };

  transact = {
    mintNewCollection: async (
      params: PoapFactoryTypes.SignExecuteMethodParams<"mintNewCollection">
    ): Promise<
      PoapFactoryTypes.SignExecuteMethodResult<"mintNewCollection">
    > => {
      return signExecuteMethod(PoapFactory, this, "mintNewCollection", params);
    },
    mintPoap: async (
      params: PoapFactoryTypes.SignExecuteMethodParams<"mintPoap">
    ): Promise<PoapFactoryTypes.SignExecuteMethodResult<"mintPoap">> => {
      return signExecuteMethod(PoapFactory, this, "mintPoap", params);
    },
  };

  async multicall<Calls extends PoapFactoryTypes.MultiCallParams>(
    calls: Calls
  ): Promise<PoapFactoryTypes.MultiCallResults<Calls>>;
  async multicall<Callss extends PoapFactoryTypes.MultiCallParams[]>(
    callss: Narrow<Callss>
  ): Promise<PoapFactoryTypes.MulticallReturnType<Callss>>;
  async multicall<
    Callss extends
      | PoapFactoryTypes.MultiCallParams
      | PoapFactoryTypes.MultiCallParams[]
  >(callss: Callss): Promise<unknown> {
    return await multicallMethods(
      PoapFactory,
      this,
      callss,
      getContractByCodeHash
    );
  }
}
