/**
 * @flow
 */
import type { DiodeQueryRequest } from "../query/DiodeQueryRequest";

export type NetworkLayer = {
  sendQueries: (requests: Array<DiodeQueryRequest>) => Promise
};

export type QueryDefinition = {
  type: string,
  request: (fragment: any, params: any, options: any) => DiodeQueryRequest,
  resolve: (response: any, fragment: any, options: any) => any
};

export type BatchQueryDefinition = {
  type: string,
  name: string,
  queryTypes: Array<string>,
  request: (
    queries: Array<DiodeQueryRequest>,
    options: any
  ) => DiodeQueryRequest,
  resolve: (response: any) => any
};

export type DiodeQuery = {
  type: string,
  request: (fragment: any, params: any, options: any) => DiodeQueryRequest,
  resolve: (response: any, fragment: any, options: any) => any,
  fragmentStructure: any,
  fragment?: any
};

export type DiodeQueryMap = {
  [key: string]: DiodeQuery
};
