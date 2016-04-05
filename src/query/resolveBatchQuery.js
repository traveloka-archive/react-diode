import type { DiodeQueryRequest } from './DiodeQueryRequest';

/**
 * Parse batch query response and assign the response to each
 * initial queries before filtered as batch queryType
 */
export default function resolveBatchQuery(
  batchResponse: any,
  initialQueries: Array<DiodeQueryRequest>,
  options: any
) {
  const responseMap = {};

  for (const queryType in batchResponse) {
    /* istanbul ignore else */
    if (batchResponse.hasOwnProperty(queryType)) {
      const queryResponse = batchResponse[queryType];
      // TODO use lodash?
      const query = _findQueryByType(initialQueries, queryType);

      if (queryResponse && query) {
        const { resolve, fragment } = query;
        responseMap[queryType] = resolve(queryResponse, fragment, options);
      }
    }
  }

  return responseMap;
}

function _findQueryByType(queries, type) {
  for (let i = 0; i < queries.length; i++) {
    if (queries[i].type === type) {
      return queries[i];
    }
  }

  return null;
}
