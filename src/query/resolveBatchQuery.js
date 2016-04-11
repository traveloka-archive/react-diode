import find from 'lodash.find';
import objectAssign from 'object-assign';
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
      const query = find(initialQueries, { type: queryType });

      // Special treatment for __additional property in batch query response.
      // This is used internally so only remove this if statement when you
      // know what you're doing
      if (queryType === '__additional') {
        const specialResponse = { __additional: queryResponse };
        objectAssign(responseMap, specialResponse);
      } else if (queryResponse && query) {
        const { resolve, fragment } = query;
        responseMap[queryType] = resolve(queryResponse, fragment, options);
      }
    }
  }

  return responseMap;
}
