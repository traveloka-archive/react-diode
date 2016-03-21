/**
 * @flow
 */
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
  QueryRequest,
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

    return this._fetchQueries(allQueries, options).then(response => {
      // Parse diode response as root container props
      const { map: queryMap } = RootContainer.query.getContainerQuery();
      return Object.keys(queryMap).reduce((props, key) => {
        props[key] = response[queryMap[key].type];
        return props;
      }, {});
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
    const pendingQueries: PendingQueryRequest = allQueries.filter(query => {
      return query.dependencies;
    });
    const queries: QueryRequest = allQueries.filter(query => {
      return !query.dependencies;
    });

    return this._networkLayer.sendQueries(queries, options).then(responses => {
      // Convert array of response into Map<QueryType, QueryResponse>
      const response = responses.reduce((map, response, id) => {
        const query = queries[id];
        const { type, fragment, resolve } = query;
        map[type] = resolve(response, fragment, options);
        return map;
      }, {});

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
      const { callback, dependencies, dependencyMap } = pendingQuery;

      dependencies.forEach(dependency => {
        if (response[dependency.type]) {
          const index = dependencyMap[dependency.type];
          pendingQuery.resolvedDependencies[index] = response[dependency.type];
        }
      });

      /* istanbul ignore else */
      if (pendingQuery.resolvedDependencies.length === dependencies.length) {
        const queryRequestInfo = callback(...pendingQuery.resolvedDependencies);
        return generateQueryRequest(pendingQuery, queryRequestInfo);
      }

      /* istanbul ignore next */
      return pendingQuery;
    });
  }
}

module.exports = new DiodeStore();
