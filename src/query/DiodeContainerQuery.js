/**
 * @flow
 */
import deepExtend from 'deep-extend';
import type { DiodeQueryMap } from '../tools/DiodeTypes';
import type { DiodeContainer } from '../container/DiodeContainer';

/**
 * Partially-complete query in given DiodeContainer
 *
 */
class DiodeContainerQuery {
  // store final query shape
  map: DiodeQueryMap = {};

  // store distinct query type
  _queryTypeMap: DiodeQueryMap = {};

  _queries: ?DiodeQueryMap;

  _children: Array<DiodeContainer>;

  constructor(queries: ?DiodeQueryMap, children: ?Array<DiodeContainer>) {
    this._queries = queries;
    this._children = children || [];

    this._parseQueryTypeMap(queries);
    this._mergeChildQueryTypeMap(children);
    this._buildFinalQueryMap(queries, children);
  }

  getQueryTypeMap(): DiodeQueryMap {
    return this._queryTypeMap;
  }

  /**
   * @internal
   * @unstable
   *
   * Add child container dynamicly and rebuilt the query map
   */
  injectChildren(children: Array<DiodeContainer>) {
    this._children = this._children.concat(children);
    this._mergeChildQueryTypeMap(children);
    this._buildFinalQueryMap(this._queries, this._children);
  }

  /**
   * Group distinct query type into single query shape, this is to make sure
   * there is no same query type with different key.
   */
  _parseQueryTypeMap(
    queries: ?DiodeQueryMap
  ): void {
    if (queries === null || queries === undefined) {
      return;
    }

    Object.keys(queries).forEach(key => {
      const query = queries[key];
      const existingQueryType = this._queryTypeMap[query.type];

      if (existingQueryType) {
        const { fragmentStructure: existingFragment } = existingQueryType;
        const { fragmentStructure: newFragment } = query;
        deepExtend(existingFragment, newFragment);
        deepExtend(existingQueryType.params, query.params);
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
  _mergeChildQueryTypeMap(
    children: ?Array<DiodeContainer>
  ): void {
    if (!children || !children.length) {
      return;
    }

    children.forEach(child => {
      const childQueryMap = child.query.map;

      /* istanbul ignore if */
      if (childQueryMap === null || childQueryMap === undefined) {
        return;
      }

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
  _buildFinalQueryMap(
    queries: ?DiodeQueryMap,
    children: ?Array<DiodeContainer>
  ): void {
    if (queries) {
      // Create initial query map from parent container via query type map.
      // For the most part, this is enough as we already compile the complete
      // fragment and usually parent and child use same query key
      this.map = Object.keys(queries).reduce((queryMap, key) => {
        const query = queries[key];
        queryMap[key] = this._queryTypeMap[query.type];
        return queryMap;
      }, {});
    }

    if (!children || !children.length) {
      return;
    }

    children.forEach(child => {
      const queryMap = child.query.map;

      Object.keys(queryMap).forEach(key => {
        const childQuery = queryMap[key];
        const existingQuery = this.map[key];

        if (existingQuery && existingQuery.type !== childQuery.type) {
          return console.warn( // eslint-disable-line no-console
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
