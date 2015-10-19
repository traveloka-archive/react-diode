import NetworkLayerSelector from './network-layer/Selector';

/**
 * @param {DiodeContainer} rootContainer
 * @param {any} options
 * @return {Promise}
 */
export default function fetchData(rootContainer, options) {
  let queries = rootContainer.queries.aggregate();
  return NetworkLayerSelector.get().sendQueries(queries, options);
}
