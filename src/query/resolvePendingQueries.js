/**
 * @flow
 */
import type {
  PendingQueryRequest,
  DiodeQueryRequest
} from './DiodeQueryRequest';

import { generateQueryRequest } from './DiodeQueryRequest';

function resolvePendingQuery(pendingQuery, response) {
  const { callback, dependencies } = pendingQuery;

  const resolvedDependencies = dependencies.map(query => {
    return response[query.type];
  }).filter(response => Boolean(response));

  if (resolvedDependencies.length === dependencies.length) {
    // all dependencies resolvedDependencies
    const queryRequestInfo = callback(...resolvedDependencies);
    const queryRequest = generateQueryRequest(pendingQuery, queryRequestInfo);

    // After resolving initial query dependencies, it's possible that the query
    // still return pending query which can be resolved using initial response.
    if (queryRequest.dependencies) {
      return resolvePendingQuery(queryRequest, response);
    }

    return queryRequest;
  } else {
    return pendingQuery;
  }
}

export default function resolvePendingQueries(
  pendingQueries: Array<PendingQueryRequest>,
  response: any
): Array<DiodeQueryRequest> {
  return pendingQueries.map(pendingQuery => {
    return resolvePendingQuery(pendingQuery, response);
  });
}
