import deepExtend from 'deep-extend';

export default class QueryManager {
  /**
   * @param {?Map<string, queryObject>}
   * @param {?Array<DiodeContainer>}
   */
  constructor(queries = {}, children) {
    let queryMap = this._generateQueryMap(queries);

    this._queryMap = queryMap;
    this._completeQueryMap = queryMap;
    this._valueMap = {};

    this._composeChildQueries(children);
  }

  _generateQueryMap(queries) {
    let queryMap = {};

    Object.keys(queries).forEach(queryKey => {
      let query = queries[queryKey];
      let queryType = query.type;
      queryMap[queryType] = query;
    });

    return queryMap;
  }

  getQuery(queryType) {
    return this._queryMap[queryType];
  }

  getCompleteQuery(queryType) {
    return this._completeQueryMap[queryType];
  }

  /**
   * Compose query from child queries
   */
  _composeChildQueries(children) {
    if (!children || !children.length) {
      return;
    }

    let completeQueryMap = this._copyQueryMap(this._completeQueryMap);

    children.forEach(child => {
      let queryMap = child.queries._completeQueryMap;

      Object.keys(queryMap).forEach(queryType => {
        let childQuery = queryMap[queryType];

        if (completeQueryMap[queryType]) {
          deepExtend(completeQueryMap[queryType].fragmentStructure, childQuery.fragmentStructure);
        } else {
          completeQueryMap[queryType] = childQuery;
        }
      });
    });

    this._completeQueryMap = completeQueryMap;
  }

  _copyQueryMap(queryMap) {
    let copiedQueryMap = {};

    Object.keys(queryMap).forEach(queryType => {
      let query = queryMap[queryType];
      copiedQueryMap[queryType] = deepExtend({}, Object.getPrototypeOf(query), query);
    });

    return copiedQueryMap;
  }

  /**
   * @param {Map<string, any>}
   * @return void
   */
  setValue(valueMap) {
    deepExtend(this._valueMap, valueMap);
  }

  /**
   * Compile queryMap with valueMap
   *
   * @return {Array<BaseQuery>}
   */
  aggregate() {
    let aggregateQueries = [];
    let queryMap = this._completeQueryMap;

    for (let prop in queryMap) {
      if (!(queryMap.hasOwnProperty(prop))) {
        continue;
      }
      let currentQuery = queryMap[prop];
      let query = this._compile(currentQuery);
      aggregateQueries.push(query);
    }
    return aggregateQueries;
  }

  /**
   * Replace fragment property in BaseQuery with value from valueMap if any
   * via JS object reference
   *
   * @param {BaseQuery} query
   * @return {BaseQuery}
   */
  _compile(query) {
    // we need to create fresh query fragment to remove
    // reference to previous fragment creation
    query.fragment = {};

    let fragment = query.fragmentStructure;
    for (var key in fragment) {
      if (fragment.hasOwnProperty(key)) {
        query.fragment[key] = this._compilePartialFragment(fragment[key]);
      }
    }

    return query;
  }

  /**
   * [DFS] Recursively replace '$value' in fragment with value from valueMap
   *
   * @param {string|Object} partialFragment
   * @return {string|Object}
   */
  _compilePartialFragment(partialFragment) {
    let partialFragmentType = typeof partialFragment;

    switch (partialFragmentType) {
      case 'string':
        if (partialFragment.charAt(0) === '$') {
          let valueKey = partialFragment.slice(1);
          let valueResult = this._valueMap[valueKey];

          if (typeof valueResult === 'undefined' || valueResult === null) {
            return partialFragment;
          }
          return valueResult;
        }
        return partialFragment;
      case 'object':
        let partialFragmentResult = {};
        for (let key in partialFragment) {
          if (partialFragment.hasOwnProperty(key)) {
            partialFragmentResult[key] = this._compilePartialFragment(partialFragment[key]);
          }
        }
        return partialFragmentResult;
      default:
        return partialFragment;
    }
  }
}
