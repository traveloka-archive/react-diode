import DiodeStore from './store/DiodeStore';
import DiodeContainer from './container/DiodeContainer';
import DiodeRootContainer from './container/DiodeRootContainer';
import DiodeQueryTypes from './query/DiodeQueryTypes';
import { createDiodeQuery } from './query/createDiodeQuery';
import {
  createQueryRequest,
  createPendingQueryRequest
} from './query/DiodeQueryRequest';

const DiodePublic = {
  Store: DiodeStore,
  QueryTypes: DiodeQueryTypes,

  createContainer: DiodeContainer.create,
  createRootContainer: DiodeRootContainer.create,
  createQuery: createDiodeQuery,
  queryRequest: createQueryRequest,
  waitForQuery: createPendingQueryRequest,
  useBatchQuery: DiodeStore.useBatchQuery.bind(DiodeStore),
  useMockQueries: DiodeStore.useMockQueries.bind(DiodeStore),
  injectNetworkLayer: DiodeStore.injectNetworkLayer.bind(DiodeStore)
};

module.exports = DiodePublic;
