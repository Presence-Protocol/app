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
import { default as PoapCollectionContractJson } from "../PoapCollection.ral.json";
import { getContractByCodeHash, registerContract } from "./contracts";
import { Trait, AllStructs } from "./types";

// Custom types for the contract
export namespace PoapCollectionTypes {
  export type Fields = {
    nftTemplateId: HexString;
    collectionUri: HexString;
    nftUri: HexString;
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
  };

  export type State = ContractState<Fields>;

  export type PoapMintedEvent = ContractEvent<{
    contractId: HexString;
    nftIndex: bigint;
    caller: Address;
  }>;

  export interface CallMethodTable {
    getCollectionUri: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    totalSupply: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    nftByIndex: {
      params: CallContractParams<{ index: bigint }>;
      result: CallContractResult<HexString>;
    };
    validateNFT: {
      params: CallContractParams<{ nftId: HexString; nftIndex: bigint }>;
      result: CallContractResult<null>;
    };
    mint: {
      params: CallContractParams<{ callerAddr: Address }>;
      result: CallContractResult<HexString>;
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
    getCollectionUri: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    totalSupply: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    nftByIndex: {
      params: SignExecuteContractMethodParams<{ index: bigint }>;
      result: SignExecuteScriptTxResult;
    };
    validateNFT: {
      params: SignExecuteContractMethodParams<{
        nftId: HexString;
        nftIndex: bigint;
      }>;
      result: SignExecuteScriptTxResult;
    };
    mint: {
      params: SignExecuteContractMethodParams<{ callerAddr: Address }>;
      result: SignExecuteScriptTxResult;
    };
  }
  export type SignExecuteMethodParams<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["params"];
  export type SignExecuteMethodResult<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["result"];
}

class Factory extends ContractFactory<
  PoapCollectionInstance,
  PoapCollectionTypes.Fields
> {
  encodeFields(fields: PoapCollectionTypes.Fields) {
    return encodeContractFields(
      addStdIdToFields(this.contract, fields),
      this.contract.fieldsSig,
      AllStructs
    );
  }

  eventIndex = { PoapMinted: 0 };
  consts = {
    ErrorCodes: {
      IncorrectTokenIndex: BigInt("0"),
      NFTNotFound: BigInt("1"),
      NFTNotPartOfCollection: BigInt("2"),
      MaxSupplyReached: BigInt("3"),
      MintEnded: BigInt("4"),
      MintNotStarted: BigInt("5"),
    },
  };

  at(address: string): PoapCollectionInstance {
    return new PoapCollectionInstance(address);
  }

  tests = {
    getCollectionUri: async (
      params: Omit<
        TestContractParamsWithoutMaps<PoapCollectionTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(
        this,
        "getCollectionUri",
        params,
        getContractByCodeHash
      );
    },
    totalSupply: async (
      params: Omit<
        TestContractParamsWithoutMaps<PoapCollectionTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "totalSupply", params, getContractByCodeHash);
    },
    nftByIndex: async (
      params: TestContractParamsWithoutMaps<
        PoapCollectionTypes.Fields,
        { index: bigint }
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "nftByIndex", params, getContractByCodeHash);
    },
    validateNFT: async (
      params: TestContractParamsWithoutMaps<
        PoapCollectionTypes.Fields,
        { nftId: HexString; nftIndex: bigint }
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "validateNFT", params, getContractByCodeHash);
    },
    mint: async (
      params: TestContractParamsWithoutMaps<
        PoapCollectionTypes.Fields,
        { callerAddr: Address }
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "mint", params, getContractByCodeHash);
    },
  };

  stateForTest(
    initFields: PoapCollectionTypes.Fields,
    asset?: Asset,
    address?: string
  ) {
    return this.stateForTest_(initFields, asset, address, undefined);
  }
}

// Use this object to test and deploy the contract
export const PoapCollection = new Factory(
  Contract.fromJson(
    PoapCollectionContractJson,
    "",
    "c067f3380f6735f6dab9dca58f3f796dfb897358c436bc69354a3b17c0421077",
    AllStructs
  )
);
registerContract(PoapCollection);

// Use this class to interact with the blockchain
export class PoapCollectionInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<PoapCollectionTypes.State> {
    return fetchContractState(PoapCollection, this);
  }

  async getContractEventsCurrentCount(): Promise<number> {
    return getContractEventsCurrentCount(this.address);
  }

  subscribePoapMintedEvent(
    options: EventSubscribeOptions<PoapCollectionTypes.PoapMintedEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      PoapCollection.contract,
      this,
      options,
      "PoapMinted",
      fromCount
    );
  }

  view = {
    getCollectionUri: async (
      params?: PoapCollectionTypes.CallMethodParams<"getCollectionUri">
    ): Promise<PoapCollectionTypes.CallMethodResult<"getCollectionUri">> => {
      return callMethod(
        PoapCollection,
        this,
        "getCollectionUri",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    totalSupply: async (
      params?: PoapCollectionTypes.CallMethodParams<"totalSupply">
    ): Promise<PoapCollectionTypes.CallMethodResult<"totalSupply">> => {
      return callMethod(
        PoapCollection,
        this,
        "totalSupply",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    nftByIndex: async (
      params: PoapCollectionTypes.CallMethodParams<"nftByIndex">
    ): Promise<PoapCollectionTypes.CallMethodResult<"nftByIndex">> => {
      return callMethod(
        PoapCollection,
        this,
        "nftByIndex",
        params,
        getContractByCodeHash
      );
    },
    validateNFT: async (
      params: PoapCollectionTypes.CallMethodParams<"validateNFT">
    ): Promise<PoapCollectionTypes.CallMethodResult<"validateNFT">> => {
      return callMethod(
        PoapCollection,
        this,
        "validateNFT",
        params,
        getContractByCodeHash
      );
    },
    mint: async (
      params: PoapCollectionTypes.CallMethodParams<"mint">
    ): Promise<PoapCollectionTypes.CallMethodResult<"mint">> => {
      return callMethod(
        PoapCollection,
        this,
        "mint",
        params,
        getContractByCodeHash
      );
    },
  };

  transact = {
    getCollectionUri: async (
      params: PoapCollectionTypes.SignExecuteMethodParams<"getCollectionUri">
    ): Promise<
      PoapCollectionTypes.SignExecuteMethodResult<"getCollectionUri">
    > => {
      return signExecuteMethod(
        PoapCollection,
        this,
        "getCollectionUri",
        params
      );
    },
    totalSupply: async (
      params: PoapCollectionTypes.SignExecuteMethodParams<"totalSupply">
    ): Promise<PoapCollectionTypes.SignExecuteMethodResult<"totalSupply">> => {
      return signExecuteMethod(PoapCollection, this, "totalSupply", params);
    },
    nftByIndex: async (
      params: PoapCollectionTypes.SignExecuteMethodParams<"nftByIndex">
    ): Promise<PoapCollectionTypes.SignExecuteMethodResult<"nftByIndex">> => {
      return signExecuteMethod(PoapCollection, this, "nftByIndex", params);
    },
    validateNFT: async (
      params: PoapCollectionTypes.SignExecuteMethodParams<"validateNFT">
    ): Promise<PoapCollectionTypes.SignExecuteMethodResult<"validateNFT">> => {
      return signExecuteMethod(PoapCollection, this, "validateNFT", params);
    },
    mint: async (
      params: PoapCollectionTypes.SignExecuteMethodParams<"mint">
    ): Promise<PoapCollectionTypes.SignExecuteMethodResult<"mint">> => {
      return signExecuteMethod(PoapCollection, this, "mint", params);
    },
  };

  async multicall<Calls extends PoapCollectionTypes.MultiCallParams>(
    calls: Calls
  ): Promise<PoapCollectionTypes.MultiCallResults<Calls>>;
  async multicall<Callss extends PoapCollectionTypes.MultiCallParams[]>(
    callss: Narrow<Callss>
  ): Promise<PoapCollectionTypes.MulticallReturnType<Callss>>;
  async multicall<
    Callss extends
      | PoapCollectionTypes.MultiCallParams
      | PoapCollectionTypes.MultiCallParams[]
  >(callss: Callss): Promise<unknown> {
    return await multicallMethods(
      PoapCollection,
      this,
      callss,
      getContractByCodeHash
    );
  }
}
