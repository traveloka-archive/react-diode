/**
 * @flow
 */
import find from 'lodash.find';
import createBatchQueryRequest from './createBatchQueryRequest';
import type { DiodeQueryRequest } from './DiodeQueryRequest';
import type { BatchQueryDefinition } from '../tools/DiodeTypes';

/**
 * Given a set of query requests, filter and transform some queries
 * as BatchQuery (if applicable).
 *
 * If BatchQuery types is incomplete, send the queries as normal query
 */
export function filterBatchQuery(
  queries: Array<DiodeQueryRequest>,
  batchQuery: BatchQueryDefinition,
  options: any
): Array<DiodeQueryRequest> {
  let filteredQueries = [];
  const { queryTypes } = batchQuery;

  const batchQueryList = queryTypes
  .map(type => find(queries, { type }))
  .filter(query => Boolean(query));

  if (batchQueryList.length === queryTypes.length) {
    const batchQueryRequest = createBatchQueryRequest(
      batchQuery,
      batchQueryList,
      options
    );
    filteredQueries.push(batchQueryRequest);
  } else {
    // incomplete batch query, send each query individually
    filteredQueries = filteredQueries.concat(batchQueryList);
  }

  const normalQueryList = queries.filter(query => {
    return batchQueryList.indexOf(query) === -1;
  });

  filteredQueries = filteredQueries.concat(normalQueryList);
  return filteredQueries;
}
