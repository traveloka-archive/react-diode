/**
 * @flow
 */
import deepExtend from "deep-extend";
import resolveContainerProps from "../container/resolveContainerProps";
import DiodeNetworkLayer from "../network/DiodeNetworkLayer";
import DiodeRootQuery from "../query/DiodeRootQuery";
import resolvePendingQueries from "../query/resolvePendingQueries";
import resolveQueryResponse from "../query/resolveQueryResponse";
import { filterBatchQuery } from "../query/filterBatchQuery";
import {
  getQueryRequests,
  generateQueryRequest
} from "../query/DiodeQueryRequest";

import type { DiodeRootContainer } from "../container/DiodeRootContainer";
import type {
  BatchQueryDefinition,
  NetworkLayer,
  // TODO Annotate QueryMockResolver in DiodeTypes
  QueryMockResolver
} from "../tools/DiodeTypes";
import type { DiodeQueryRequest } from "../query/DiodeQueryRequest";

class DiodeStore {
  _networkLayer: DiodeNetworkLayer;

  _batchQueryEnabled: boolean;

  _batchQuery: BatchQueryDefinition;

  constructor() {
    this._batchQueriesEnabled = false;
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
   */
  useMockQueries(queryMockResolver: QueryMockResolver): void {
    this._networkLayer.injectQueryMockResolver(queryMockResolver);
  }

  /**
   * @public
   */
  useBatchQuery(batchQuery: BatchQueryDefinition): void {
    /* istanbul ignore else */
    if (batchQuery) {
      this._batchQueryEnabled = true;
      this._batchQuery = batchQuery;
    }
  }

  /**
   * @public
   *
   * Send queries via network layer bypassing internal cache. Note that the
   * server may respond with 304 status but it's not actually an internal
   * cached response
   */
  forceFetch(RootContainer: DiodeRootContainer, options: any): Promise {
    const queries = getQueryRequests(RootContainer, options);
    return this._fetchQueries(queries, options).then(response => {
      return resolveContainerProps(response, RootContainer);
    });
  }

  filterCachedFragments(query) {
    const cache = this.cache[query.type];

    if (!cache) {
      return query;
    }

    const filteredFragments = {};
    Object.keys(query.fragment).forEach(fragmentKey => {
      if (cache[fragmentKey]) {
        // TODO check fetch 1, fetch all
        // 1st pass { a: null }
        // 2nd pass { }
        return;
      }

      filteredFragments[fragmentKey] = {};
      // this query type might be partially cached
      // check specific fragment
      const innerFragment = query.fragment[fragmentKey];
      const innerFragmentKeys = Object.keys(innerFragment);
      innerFragmentKeys.forEach(innerKey => {
        if (cache[fragmentKey] && cache[fragmentKey][innerKey]) {
          return;
        }

        filteredFragments[fragmentKey][innerKey] = innerFragment[innerKey];
      });
    });

    return {
      ...query,
      fragment: filteredFragments
    };
  }

  async fetch(rawQuery, options) {
    const rootQuery = new DiodeRootQuery(rawQuery);
    const queries = rootQuery
      .compile()
      .map(query => {
        const { fragment, params } = this.filterCachedFragments(query);
        if (Object.keys(fragment).length === 0) {
          return null;
        }

        const queryRequestInfo = query.request(fragment, params, options);
        return generateQueryRequest(query, queryRequestInfo);
      })
      .filter(Boolean);

    const response = await this._fetchQueries(queries, options);
    deepExtend(this.cache, response);
  }

  /**
   * Recursively fetch over query dependency, starting with query with no
   * dependency, and build response moving up
   *
   * TODO:
   *  - All DiodeQueryRequest should contain pending property for filtering
   *    instead of using query.dependencies which is not available in normal
   *    QueryRequest
   */
  _fetchQueries(
    allQueries: Array<DiodeQueryRequest>,
    options: any = {}
  ): Promise {
    // We need to store unmodified initial queries before filtered
    // into batch query so we can use their resolve function when resolving
    // response from batch query
    const pendingQueries = allQueries.filter(query => query.dependencies);
    const initialQueries = allQueries.filter(query => !query.dependencies);
    let queries = initialQueries;

    if (this._batchQueryEnabled) {
      queries = filterBatchQuery(queries, this._batchQuery, options);
    }

    return this._networkLayer
      .sendQueries(queries, options)
      .then(queryResponseMap => {
        const responseMap = resolveQueryResponse(
          queries,
          initialQueries,
          queryResponseMap,
          options
        );

        if (pendingQueries.length > 0) {
          const nextQueries = resolvePendingQueries(
            pendingQueries,
            responseMap
          );
          return this._fetchQueries(nextQueries, options).then(
            nextResponseMap => {
              return Object.assign(responseMap, nextResponseMap);
            }
          );
        }

        return responseMap;
      });
  }
}

export default new DiodeStore();
