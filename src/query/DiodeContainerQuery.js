/**
 * @flow
 */
import deepExtend from 'deep-extend';
import type { DiodeQuery } from '../tools/DiodeTypes';
import type { DiodeContainer } from '../container/DiodeContainer';

type DiodeChildren = ?Array<DiodeContainer>;

type QueryMap = {
  [key: string]: DiodeQuery
}

/**
 * Partially-complete query in given DiodeContainer
 *
 */
class DiodeContainerQuery {
  // store final query shape
  map: QueryMap = {};

  // store distinct query type
  _queryTypeMap: QueryMap = {};

  constructor(queries: QueryMap, children: DiodeChildren) {
    this._parseQueryTypeMap(queries);
    this._mergeChildQueryTypeMap(children);
    this._buildFinalQueryMap(queries, children);
  }

  getQueryTypeMap(): QueryMap {
    return this._queryTypeMap;
  }

  /**
   * Group distinct query type into single query shape, this is to make sure
   * there is no same query type with different key.
   */
  _parseQueryTypeMap(queries: DiodeQuery): void {
    Object.keys(queries).forEach(key => {
      const query = queries[key];
      const existingQueryType = this._queryTypeMap[query.type];

      if (existingQueryType) {
        const { fragmentStructure: existingFragment } = existingQueryType;
        const { fragmentStructure: newFragment } = query;
        deepExtend(existingFragment, newFragment);
      } else {
        this._queryTypeMap[query.type] = query;
      }
    });
  }

  /**
   * Merge all child query map with existing query map, also merge all queries
   * with same type as we can have different key between parent-child that
   * represent same query type
   */
  _mergeChildQueryTypeMap(children: DiodeChildren): void {
    if (!children || !children.length) {
      return;
    }

    children.forEach(child => {
      const childQueryMap = child.query.map;

      Object.keys(childQueryMap).forEach(key => {
        const childQuery = childQueryMap[key];
        const existingQueryType = this._queryTypeMap[childQuery.type];

        if (existingQueryType) {
          const { fragmentStructure: existingFragment } = existingQueryType;
          const { fragmentStructure: newFragment } = childQuery;
          deepExtend(existingFragment, newFragment);
        } else {
          this._queryTypeMap[childQuery.type] = childQuery;
        }
      });
    });
  }

  /**
   * Given complete query type map from current container and child container,
   * re-generate query map from initial queries with the complete query
   */
  _buildFinalQueryMap(queries: DiodeQuery, children: DiodeChildren): void {
    // Create initial query map from parent container via query type map.
    // For the most part, this is enough as we already compile the complete
    // fragment and usually parent and child use same query key
    this.map = Object.keys(queries).reduce((queryMap, key) => {
      const query = queries[key];
      queryMap[key] = this._queryTypeMap[query.type];
      return queryMap;
    }, {});

    if (!children || !children.length) {
      return;
    }

    children.forEach(child => {
      const queryMap = child.query.map;

      Object.keys(queryMap).forEach(key => {
        const childQuery = queryMap[key];
        const existingQuery = this.map[key];

        if (existingQuery && existingQuery.type !== childQuery.type) {
          return console.warn(
            'Found same query key (%s) with different type (%s and %s)',
            key,
            existingQuery.type,
            childQuery.type
          );
        }

        this.map[key] = this._queryTypeMap[childQuery.type];
      });
    });
  }
}

module.exports = DiodeContainerQuery;
