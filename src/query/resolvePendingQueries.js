/**
 * @flow
 */
import type {
  PendingQueryRequest,
  DiodeQueryRequest
} from './DiodeQueryRequest';

import { generateQueryRequest } from './DiodeQueryRequest';

export default function resolvePendingQueries(
  pendingQueries: Array<PendingQueryRequest>,
  response: any
): Array<DiodeQueryRequest> {
  return pendingQueries.map(pendingQuery => {
    const { callback, dependencies } = pendingQuery;

    const resolvedDependencies = dependencies.map(query => {
      return response[query.type];
    }).filter(response => Boolean(response));

    if (resolvedDependencies.length === dependencies.length) {
      // all dependencies resolvedDependencies
      const queryRequestInfo = callback(...resolvedDependencies);
      return generateQueryRequest(pendingQuery, queryRequestInfo);
    } else {
      return pendingQuery;
    }
  });
}
