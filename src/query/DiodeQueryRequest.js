import type { DiodeRootContainer } from '../container/DiodeRootContainer';
import type { QueryDefinition } from '../tools/DiodeTypes';

export type PendingQueryCallback = (response: any) => any

type QueryRequestInfo = {
  url: string,
  method: string,
  payload: any
}

type PendingQueryRequestInfo = {
  pending: bool,
  dependency: QueryDefinition,
  callback: PendingQueryCallback
}

export type QueryRequest = {
  type: string,
  fragment: any,
  resolve: (response: any) => any,
  url: string,
  method: string,
  payload: any
}

export type PendingQueryRequest = {
  type: string,
  fragment: any,
  resolve: (response: any) => any,
  pending: bool,
  dependency: QueryDefinition,
  callback: PendingQueryCallback
}

// TODO find a way to merge this type without writing twice
export type DiodeQueryRequestInfo = QueryRequestInfo | PendingQueryRequestInfo;
export type DiodeQueryRequest = QueryRequest | PendingQueryRequest

/**
 * @public
 *
 */
export function createPendingQueryRequest(
  Query: QueryDefinition,
  callback: PendingQueryCallback
): PendingQueryRequestInfo {
  return {
    pending: true,
    dependency: Query,
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
