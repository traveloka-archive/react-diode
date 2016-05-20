/**
 * @flow
 */
import type { DiodeRootContainer } from '../container/DiodeRootContainer';
import type { DiodeQuery, QueryDefinition } from '../tools/DiodeTypes';

export type PendingQueryCallback = (response: any) => any

type QueryRequestInfo = {
  pending: boolean,
  url: string,
  method: string,
  payload: any
}

type PendingQueryRequestInfo = {
  pending: boolean,
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

export type DiodeQueryRequest = QueryRequest | PendingQueryRequest;

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

  return {
    pending: true,
    dependencies: QueryDependencies,
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
  payload: any,
  headers: any = {}
): QueryRequestInfo {
  return {
    pending: false,
    url,
    method,
    payload,
    headers
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
  query: DiodeQuery,
  queryRequestInfo: QueryRequestInfo
): DiodeQueryRequest {
  const { type, fragment, resolve } = query;

  return {
    type,
    fragment,
    resolve,
    ...queryRequestInfo
  };
}
