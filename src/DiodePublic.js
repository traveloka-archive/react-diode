import DiodeStore from './store/DiodeStore';
import DiodeContainer from './container/DiodeContainer';
import DiodeRootContainer from './container/DiodeRootContainer';
import DiodeDefaultNetworkLayer from './network-layer/DiodeDefaultNetworkLayer';
import { createDiodeQuery } from './query/createDiodeQuery';
import {
  createQueryRequest,
  createPendingQueryRequest
} from './query/DiodeQueryRequest';

const DiodePublic = {
  Store: DiodeStore,
  DefaultNetworkLayer: DiodeDefaultNetworkLayer,

  createContainer: DiodeContainer.create,
  createRootContainer: DiodeRootContainer.create,
  createQuery: createDiodeQuery,
  queryRequest: createQueryRequest,
  waitForQuery: createPendingQueryRequest,
  injectNetworkLayer: DiodeStore.injectNetworkLayer.bind(DiodeStore)
};

module.exports = DiodePublic;
