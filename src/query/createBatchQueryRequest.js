/**
 * @flow
 */
import type { BatchQueryDefinition } from "../tools/DiodeTypes";
import type { DiodeQueryRequest } from "./DiodeQueryRequest";

export default function createBatchQueryRequest(
  query: BatchQueryDefinition,
  queryList: Array<DiodeQueryRequest>,
  options: any
): DiodeQueryRequest {
  const { resolve, type } = query;

  return {
    type,
    resolve,
    ...query.request(queryList, options)
  };
}
