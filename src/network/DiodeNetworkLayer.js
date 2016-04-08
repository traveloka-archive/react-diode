/**
 * @flow
 */
import objectAssign from 'object-assign';
import type { DiodeQueryRequest } from '../query/DiodeQueryRequest';
import type {
  NetworkLayer,
  QueryMockResolver
} from '../tools/DiodeTypes';

class DiodeNetworkLayer {
  _injectedNetworkLayer: NetworkLayer;

  _queryMockEnabled: boolean;

  constructor() {
    this._queryMockEnabled = false;
  }

  /**
   * @internal
   *
   * Supply your own network layer
   */
  injectNetworkLayer(
    networkLayer: NetworkLayer
  ): void {
    this._injectedNetworkLayer = networkLayer;
  }

  injectQueryMockResolver(
    queryMockResolver: QueryMockResolver
  ): void {
    this._queryMockEnabled = true;
    this._queryMockResolver = queryMockResolver;
  }

  /**
   * @internal
   *
   * Send diode query via injected network layer
   */
  sendQueries(
    queries: Array<DiodeQueryRequest>,
    options: any
  ): Promise {
    let queryRequests = queries;
    const mockedQueryResponse = {};
    const networkLayer = this._getCurrentNetworkLayer();

    if (this._queryMockEnabled) {
      queryRequests = queries.filter(query => {
        // check whether a query as a mocked response
        const queryMockResolver = this._queryMockResolver[query.type];
        if (queryMockResolver && typeof queryMockResolver === 'function') {
          const mockedResponse = queryMockResolver(query);
          if (mockedResponse) {
            mockedQueryResponse[query.type] = mockedResponse;
            return false;
          } {
            return true;
          }
        } else {
          return true;
        }
      });
    }

    return networkLayer.sendQueries(queryRequests, options).then(response => {
      return objectAssign(mockedQueryResponse, response);
    });
  }

  _getCurrentNetworkLayer(): NetworkLayer {
    return this._injectedNetworkLayer;
  }
}

module.exports = DiodeNetworkLayer;
