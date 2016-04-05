/**
 * @flow
 */
import createBatchQueryRequest from './createBatchQueryRequest';
import type { DiodeQueryRequest } from './DiodeQueryRequest';
import type { BatchQueryDefinition } from '../tools/DiodeTypes';

/**
 * Given a set of query requests, filter and transform queries
 * that's as BatchQuery (if applicable). If BatchQuery types
 * is incomplete, send the queries as normal query
 */
export default function filterBatchQueries(
  queries: Array<DiodeQueryRequest>,
  batchQueries: Array<BatchQueryDefinition>,
  options: any
): Array<DiodeQueryRequest> {
  const batchQueryList = {};
  let filteredQueries = [];

  const batchTypeMap = batchQueries.reduce((typeMap, { queryTypes, name }) => {
    queryTypes.forEach(type => {
      typeMap[type] = name;
    });
    return typeMap;
  }, {});

  const batchQueryMap = batchQueries.reduce((batchMap, query) => {
    batchMap[query.name] = query;
    return batchMap;
  }, {});

  queries.forEach(query => {
    const batchQueryName = batchTypeMap[query.type];

    if (batchQueryName) {
      batchQueryList[batchQueryName] = batchQueryList[batchQueryName] || [];
      batchQueryList[batchQueryName].push(query);
    } else {
      filteredQueries.push(query);
    }
  });

  Object.keys(batchQueryList).forEach(name => {
    const queryList = batchQueryList[name];
    const BatchQuery = batchQueryMap[name];

    if (queryList.length === BatchQuery.queryTypes.length) {
      const queryRequest = createBatchQueryRequest(
        BatchQuery,
        queryList,
        options
      );
      filteredQueries.push(queryRequest);
    } else {
      // incomplete batch query, send query as normal query
      filteredQueries = filteredQueries.concat(queryList);
    }
  });

  return filteredQueries;
}
