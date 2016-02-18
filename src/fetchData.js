import Query from './query/Query';
import { get as getNetworkLayer } from './network-layer/Selector';

/**
 * @param {DiodeContainer} rootContainer
 * @param {any} options
 * @return {Promise}
 */
module.exports = function fetchData(rootContainer, options) {
  const queries = Query.aggregate(rootContainer, options);
  const network = getNetworkLayer();

  return network.sendQueries(queries, options);
};
