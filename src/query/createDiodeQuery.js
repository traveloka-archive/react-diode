/**
 * @flow
 */
import type { QueryDefinition, DiodeQuery } from '../tools/DiodeTypes';

function createDiodeQuery(
  Query: QueryDefinition,
  fragmentStructure: any,
  paramsStructure: any = {}
): DiodeQuery {
  if (typeof Query.type !== 'string') {
    throw new TypeError('Expected query definition to have query type');
  }

  if (typeof Query.request !== 'function') {
    throw new TypeError('Expected query definition to have .request() method');
  }

  if (typeof Query.resolve !== 'function') {
    throw new TypeError('Expected query definition to have .resolve() method');
  }

  const query = Object.create(Query);
  query.fragmentStructure = fragmentStructure;
  query.paramsStructure = paramsStructure;
  return query;
}

module.exports = {
  createDiodeQuery
};
