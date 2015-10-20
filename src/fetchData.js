import Query from './query/Query';
import NetworkLayerSelector from './network-layer/Selector';

/**
 * @param {DiodeContainer} rootContainer
 * @param {any} options
 * @return {Promise}
 */
export default function fetchData(rootContainer, options) {
  let queries = Query.aggregate(rootContainer, options);
  let network = NetworkLayerSelector.get();

  return network.sendQueries(queries, options);
}
