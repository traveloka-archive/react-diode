import { CacheContext, createCache } from "./cache/DiodeCache";
import DiodeStore from "./store/DiodeStore";
import { createContainer } from "./container/DiodeContainer";
import { createRootContainer } from "./container/DiodeRootContainer";
import DiodeQueryTypes from "./query/DiodeQueryTypes";
import { createDiodeQuery } from "./query/createDiodeQuery";
import {
  createQueryRequest,
  createPendingQueryRequest
} from "./query/DiodeQueryRequest";

const DiodePublic = {
  Store: DiodeStore,
  CacheProvider: CacheContext.Provider,
  QueryTypes: DiodeQueryTypes,

  createCache,
  createContainer,
  createRootContainer,
  createQuery: createDiodeQuery,
  queryRequest: createQueryRequest,
  waitForQuery: createPendingQueryRequest,
  useBatchQuery: DiodeStore.useBatchQuery.bind(DiodeStore),
  useMockQueries: DiodeStore.useMockQueries.bind(DiodeStore),
  injectNetworkLayer: DiodeStore.injectNetworkLayer.bind(DiodeStore)
};

export default DiodePublic;
