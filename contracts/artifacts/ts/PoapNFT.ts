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
import { default as PoapNFTContractJson } from "../PoapNFT.ral.json";
import { getContractByCodeHash, registerContract } from "./contracts";
import { Trait, AllStructs } from "./types";

// Custom types for the contract
export namespace PoapNFTTypes {
  export type Fields = {
    collectionId: HexString;
    nftIndex: bigint;
    uri: HexString;
    image: HexString;
    eventName: HexString;
    description: HexString;
    organizer: Address;
    location: HexString;
    eventStartAt: bigint;
    eventEndAt: bigint;
  };

  export type State = ContractState<Fields>;

  export type MetadataUpdatedEvent = ContractEvent<{}>;

  export interface CallMethodTable {
    getTokenUri: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getCollectionIndex: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<[HexString, bigint]>;
    };
    getName: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getDescription: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getImage: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getTraitCount: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getTraitAtIndex: {
      params: CallContractParams<{ index: bigint }>;
      result: CallContractResult<Trait>;
    };
    getNFTIndex: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<bigint>;
    };
    getTraits: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<[Trait, Trait, Trait, Trait, Trait, Trait]>;
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
    getTokenUri: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getCollectionIndex: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getName: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getDescription: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getImage: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getTraitCount: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getTraitAtIndex: {
      params: SignExecuteContractMethodParams<{ index: bigint }>;
      result: SignExecuteScriptTxResult;
    };
    getNFTIndex: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getTraits: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
  }
  export type SignExecuteMethodParams<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["params"];
  export type SignExecuteMethodResult<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["result"];
}

class Factory extends ContractFactory<PoapNFTInstance, PoapNFTTypes.Fields> {
  encodeFields(fields: PoapNFTTypes.Fields) {
    return encodeContractFields(
      addStdIdToFields(this.contract, fields),
      this.contract.fieldsSig,
      AllStructs
    );
  }

  eventIndex = { MetadataUpdated: 0 };

  at(address: string): PoapNFTInstance {
    return new PoapNFTInstance(address);
  }

  tests = {
    getTokenUri: async (
      params: Omit<
        TestContractParamsWithoutMaps<PoapNFTTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getTokenUri", params, getContractByCodeHash);
    },
    getCollectionIndex: async (
      params: Omit<
        TestContractParamsWithoutMaps<PoapNFTTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<[HexString, bigint]>> => {
      return testMethod(
        this,
        "getCollectionIndex",
        params,
        getContractByCodeHash
      );
    },
    getName: async (
      params: Omit<
        TestContractParamsWithoutMaps<PoapNFTTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getName", params, getContractByCodeHash);
    },
    getDescription: async (
      params: Omit<
        TestContractParamsWithoutMaps<PoapNFTTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getDescription", params, getContractByCodeHash);
    },
    getImage: async (
      params: Omit<
        TestContractParamsWithoutMaps<PoapNFTTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getImage", params, getContractByCodeHash);
    },
    getTraitCount: async (
      params: Omit<
        TestContractParamsWithoutMaps<PoapNFTTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getTraitCount", params, getContractByCodeHash);
    },
    getTraitAtIndex: async (
      params: TestContractParamsWithoutMaps<
        PoapNFTTypes.Fields,
        { index: bigint }
      >
    ): Promise<TestContractResultWithoutMaps<Trait>> => {
      return testMethod(this, "getTraitAtIndex", params, getContractByCodeHash);
    },
    getNFTIndex: async (
      params: Omit<
        TestContractParamsWithoutMaps<PoapNFTTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<bigint>> => {
      return testMethod(this, "getNFTIndex", params, getContractByCodeHash);
    },
    getTraits: async (
      params: Omit<
        TestContractParamsWithoutMaps<PoapNFTTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<
      TestContractResultWithoutMaps<[Trait, Trait, Trait, Trait, Trait, Trait]>
    > => {
      return testMethod(this, "getTraits", params, getContractByCodeHash);
    },
  };

  stateForTest(
    initFields: PoapNFTTypes.Fields,
    asset?: Asset,
    address?: string
  ) {
    return this.stateForTest_(initFields, asset, address, undefined);
  }
}

// Use this object to test and deploy the contract
export const PoapNFT = new Factory(
  Contract.fromJson(
    PoapNFTContractJson,
    "",
    "4bba64d6343d92d1ff63fe12e5d7af76f16a474dc63554ef3048213e76b7e474",
    AllStructs
  )
);
registerContract(PoapNFT);

// Use this class to interact with the blockchain
export class PoapNFTInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<PoapNFTTypes.State> {
    return fetchContractState(PoapNFT, this);
  }

  async getContractEventsCurrentCount(): Promise<number> {
    return getContractEventsCurrentCount(this.address);
  }

  subscribeMetadataUpdatedEvent(
    options: EventSubscribeOptions<PoapNFTTypes.MetadataUpdatedEvent>,
    fromCount?: number
  ): EventSubscription {
    return subscribeContractEvent(
      PoapNFT.contract,
      this,
      options,
      "MetadataUpdated",
      fromCount
    );
  }

  view = {
    getTokenUri: async (
      params?: PoapNFTTypes.CallMethodParams<"getTokenUri">
    ): Promise<PoapNFTTypes.CallMethodResult<"getTokenUri">> => {
      return callMethod(
        PoapNFT,
        this,
        "getTokenUri",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getCollectionIndex: async (
      params?: PoapNFTTypes.CallMethodParams<"getCollectionIndex">
    ): Promise<PoapNFTTypes.CallMethodResult<"getCollectionIndex">> => {
      return callMethod(
        PoapNFT,
        this,
        "getCollectionIndex",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getName: async (
      params?: PoapNFTTypes.CallMethodParams<"getName">
    ): Promise<PoapNFTTypes.CallMethodResult<"getName">> => {
      return callMethod(
        PoapNFT,
        this,
        "getName",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getDescription: async (
      params?: PoapNFTTypes.CallMethodParams<"getDescription">
    ): Promise<PoapNFTTypes.CallMethodResult<"getDescription">> => {
      return callMethod(
        PoapNFT,
        this,
        "getDescription",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getImage: async (
      params?: PoapNFTTypes.CallMethodParams<"getImage">
    ): Promise<PoapNFTTypes.CallMethodResult<"getImage">> => {
      return callMethod(
        PoapNFT,
        this,
        "getImage",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getTraitCount: async (
      params?: PoapNFTTypes.CallMethodParams<"getTraitCount">
    ): Promise<PoapNFTTypes.CallMethodResult<"getTraitCount">> => {
      return callMethod(
        PoapNFT,
        this,
        "getTraitCount",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getTraitAtIndex: async (
      params: PoapNFTTypes.CallMethodParams<"getTraitAtIndex">
    ): Promise<PoapNFTTypes.CallMethodResult<"getTraitAtIndex">> => {
      return callMethod(
        PoapNFT,
        this,
        "getTraitAtIndex",
        params,
        getContractByCodeHash
      );
    },
    getNFTIndex: async (
      params?: PoapNFTTypes.CallMethodParams<"getNFTIndex">
    ): Promise<PoapNFTTypes.CallMethodResult<"getNFTIndex">> => {
      return callMethod(
        PoapNFT,
        this,
        "getNFTIndex",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getTraits: async (
      params?: PoapNFTTypes.CallMethodParams<"getTraits">
    ): Promise<PoapNFTTypes.CallMethodResult<"getTraits">> => {
      return callMethod(
        PoapNFT,
        this,
        "getTraits",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
  };

  transact = {
    getTokenUri: async (
      params: PoapNFTTypes.SignExecuteMethodParams<"getTokenUri">
    ): Promise<PoapNFTTypes.SignExecuteMethodResult<"getTokenUri">> => {
      return signExecuteMethod(PoapNFT, this, "getTokenUri", params);
    },
    getCollectionIndex: async (
      params: PoapNFTTypes.SignExecuteMethodParams<"getCollectionIndex">
    ): Promise<PoapNFTTypes.SignExecuteMethodResult<"getCollectionIndex">> => {
      return signExecuteMethod(PoapNFT, this, "getCollectionIndex", params);
    },
    getName: async (
      params: PoapNFTTypes.SignExecuteMethodParams<"getName">
    ): Promise<PoapNFTTypes.SignExecuteMethodResult<"getName">> => {
      return signExecuteMethod(PoapNFT, this, "getName", params);
    },
    getDescription: async (
      params: PoapNFTTypes.SignExecuteMethodParams<"getDescription">
    ): Promise<PoapNFTTypes.SignExecuteMethodResult<"getDescription">> => {
      return signExecuteMethod(PoapNFT, this, "getDescription", params);
    },
    getImage: async (
      params: PoapNFTTypes.SignExecuteMethodParams<"getImage">
    ): Promise<PoapNFTTypes.SignExecuteMethodResult<"getImage">> => {
      return signExecuteMethod(PoapNFT, this, "getImage", params);
    },
    getTraitCount: async (
      params: PoapNFTTypes.SignExecuteMethodParams<"getTraitCount">
    ): Promise<PoapNFTTypes.SignExecuteMethodResult<"getTraitCount">> => {
      return signExecuteMethod(PoapNFT, this, "getTraitCount", params);
    },
    getTraitAtIndex: async (
      params: PoapNFTTypes.SignExecuteMethodParams<"getTraitAtIndex">
    ): Promise<PoapNFTTypes.SignExecuteMethodResult<"getTraitAtIndex">> => {
      return signExecuteMethod(PoapNFT, this, "getTraitAtIndex", params);
    },
    getNFTIndex: async (
      params: PoapNFTTypes.SignExecuteMethodParams<"getNFTIndex">
    ): Promise<PoapNFTTypes.SignExecuteMethodResult<"getNFTIndex">> => {
      return signExecuteMethod(PoapNFT, this, "getNFTIndex", params);
    },
    getTraits: async (
      params: PoapNFTTypes.SignExecuteMethodParams<"getTraits">
    ): Promise<PoapNFTTypes.SignExecuteMethodResult<"getTraits">> => {
      return signExecuteMethod(PoapNFT, this, "getTraits", params);
    },
  };

  async multicall<Calls extends PoapNFTTypes.MultiCallParams>(
    calls: Calls
  ): Promise<PoapNFTTypes.MultiCallResults<Calls>>;
  async multicall<Callss extends PoapNFTTypes.MultiCallParams[]>(
    callss: Narrow<Callss>
  ): Promise<PoapNFTTypes.MulticallReturnType<Callss>>;
  async multicall<
    Callss extends PoapNFTTypes.MultiCallParams | PoapNFTTypes.MultiCallParams[]
  >(callss: Callss): Promise<unknown> {
    return await multicallMethods(PoapNFT, this, callss, getContractByCodeHash);
  }
}
