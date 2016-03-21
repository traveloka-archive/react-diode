/**
 * @flow
 */
import type { DiodeRootContainer } from '../container/DiodeRootContainer';
import type { QueryDefinition } from '../tools/DiodeTypes';

export type PendingQueryCallback = (response: any) => any

type QueryRequestInfo = {
  url: string,
  method: string,
  payload: any
}

type PendingQueryRequestInfo = {
  dependencies: Array<QueryDefinition>,
  dependencyMap: {
    [queryType: string]: number
  },
  resolvedDependencies: Array,
  callback: PendingQueryCallback
}

type QueryInfo = {
  type: string,
  fragment: any,
  resolve: (response: any) => any,
}

export type QueryRequest = QueryInfo & QueryRequestInfo
export type PendingQueryRequest = QueryInfo & PendingQueryRequestInfo
export type DiodeQueryRequestInfo = QueryRequestInfo | PendingQueryRequestInfo;
export type DiodeQueryRequest = QueryRequest | PendingQueryRequest

/**
 * @public
 *
 */
export function createPendingQueryRequest(
  QueryDependencies: QueryDefinition | Array<QueryDefinition>,
  callback: PendingQueryCallback
): PendingQueryRequestInfo {
  if (!(QueryDependencies instanceof Array)) {
    QueryDependencies = [QueryDependencies];
  }

  // Create a temporary dependency map to sort resolved query later. We need to
  // sort the query resolution because the callback must be called with the same
  // sequence as listed query dependencies
  //
  // By creating this map, we can then "sort" query resolution in O(1) using
  // dependencyMap[QueryType] as the index to put the query
  const dependencyMap = QueryDependencies.reduce((map, Query, index) => {
    map[Query.type] = index;
    return map;
  }, {});

  return {
    dependencies: QueryDependencies,
    dependencyMap,
    resolvedDependencies: [],
    callback
  };
}

/**
 * @public
 *
 */
export function createQueryRequest(
  url: string,
  method: string,
  payload: any
): QueryRequestInfo {
  return {
    url,
    method,
    payload
  };
}

/**
 * @internal
 *
 */
export function getQueryRequests(
  RootContainer: DiodeRootContainer,
  options: any,
): Array<DiodeQueryRequest> {
  const queries = RootContainer.query.compile();

  return queries.map(query => {
    const { fragment, params } = query;
    const queryRequestInfo = query.request(fragment, params, options);
    return generateQueryRequest(query, queryRequestInfo);
  });
}

/**
 * @internal
 *
 * Generate query request to be sent via sendQueries
 */
export function generateQueryRequest(
  QueryShape: QueryDefinition,
  queryRequestInfo: QueryRequestInfo
): DiodeQueryRequest {
  const { type, fragment, resolve } = QueryShape;

  return {
    type,
    fragment,
    resolve,
    ...queryRequestInfo
  };
}
