/* Diode Public API */
import createContainer from './Container';
import Query from './query/Query';
import QueryTypes from './query/Types';
import fetchData from './fetchData';
import { injectNetworkLayer } from './network-layer/Selector';

export default {
  QueryTypes,
  createContainer,
  Query,
  fetchData,
  injectNetworkLayer
};
