/* Diode Public API */
import createContainer from './Container';
import QueryTypes from './query/Types';
import fetchData from './fetchData';
import { injectNetworkLayer } from './network-layer/Selector';

export default {
  QueryTypes,
  createContainer,
  fetchData,
  injectNetworkLayer
};
