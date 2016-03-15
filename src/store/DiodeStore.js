import objectAssign from 'object-assign';
import DiodeNetworkLayer from '../network/DiodeNetworkLayer';
import type { NetworkLayer } from '../tools/DiodeTypes';
import type { DiodeRootContainer } from '../container/DiodeRootContainer';
import {
  getQueryRequests,
  generateQueryRequest
} from '../query/DiodeQueryRequest';

import type {
  DiodeQueryRequest,
  PendingQueryRequest
} from '../query/DiodeQueryRequest';

class DiodeStore {
  _networkLayer: DiodeNetworkLayer;

  constructor() {
    this._networkLayer = new DiodeNetworkLayer();
  }

  /**
   * @public
   */
  injectNetworkLayer(networkLayer: NetworkLayer): void {
    this._networkLayer.injectNetworkLayer(networkLayer);
  }

  /**
   * @public
   *
   * Send queries via network layer bypassing internal cache. Note that the
   * server may respond with 304 status but it's not actually a cached response
   */
  forceFetch(
    RootContainer: DiodeRootContainer,
    options: any
  ): Promise {
    const allQueries = getQueryRequests(RootContainer);
    return this._fetchQueries(allQueries, options).then(__diodeResponse => {
      return { __diodeResponse };
    });
  }

  /**
   * Recursively fetch over query dependency, starting with query with no
   * dependency, and build up response moving up
   */
  _fetchQueries(
    allQueries: Array<DiodeQueryRequest>,
    options: any = {}
  ): Promise {
    const pendingQueries = allQueries.filter(query => query.pending);
    const queries = allQueries.filter(query => !query.pending);

    return this._networkLayer.sendQueries(queries, options).then(response => {
      if (pendingQueries.length > 0) {
        const queries = this._resolvePendingQueries(pendingQueries, response);
        return this._fetchQueries(queries, options).then(pendingResponse => {
          return objectAssign(response, pendingResponse);
        });
      }

      return response;
    });
  }

  _resolvePendingQueries(
    pendingQueries: Array<PendingQueryRequest>,
    response: any
  ): Array<DiodeQueryRequest> {
    return pendingQueries.map(pendingQuery => {
      const { callback, dependency } = pendingQuery;

      /* istanbul ignore else */
      if (response[dependency.type]) {
        const queryRequestInfo = callback(response[dependency.type]);
        return generateQueryRequest(pendingQuery, queryRequestInfo);
      }

      /* istanbul ignore next */
      return pendingQuery;
    });
  }
}

module.exports = new DiodeStore();
