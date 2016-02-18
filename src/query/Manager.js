import deepExtend from 'deep-extend';

module.exports = class QueryManager {
  /**
   * @param {?Map<string, queryObject>}
   * @param {?Array<DiodeContainer>}
   */
  constructor(queries = {}, children) {
    const queryMap = this._generateQueryMap(queries);

    this._queryMap = queryMap;
    this._completeQueryMap = queryMap;
    this._valueMap = {};

    this._composeChildQueries(children);
  }

  _generateQueryMap(queries) {
    const queryMap = {};

    Object.keys(queries).forEach(queryKey => {
      const query = queries[queryKey];
      const queryType = query.type;
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

    const completeQueryMap = this._copyQueryMap(this._completeQueryMap);

    children.forEach(child => {
      const queryMap = child.queries._completeQueryMap;

      Object.keys(queryMap).forEach(queryType => {
        const childQuery = queryMap[queryType];

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
    const copiedQueryMap = {};

    Object.keys(queryMap).forEach(queryType => {
      const query = queryMap[queryType];
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
    const aggregateQueries = [];
    const queryMap = this._completeQueryMap;

    for (const prop in queryMap) {
      if (!(queryMap.hasOwnProperty(prop))) {
        continue;
      }
      const currentQuery = queryMap[prop];
      const query = this._compile(currentQuery);
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

    const fragment = query.fragmentStructure;
    for (const key in fragment) {
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
    const partialFragmentType = typeof partialFragment;

    switch (partialFragmentType) {
      case 'string':
        if (partialFragment.charAt(0) === '$') {
          const valueKey = partialFragment.slice(1);
          const valueResult = this._valueMap[valueKey];

          if (typeof valueResult === 'undefined' || valueResult === null) {
            return partialFragment;
          }
          return valueResult;
        }
        return partialFragment;
      case 'object': {
        const partialFragmentResult = {};
        for (const key in partialFragment) {
          if (partialFragment.hasOwnProperty(key)) {
            partialFragmentResult[key] = this._compilePartialFragment(partialFragment[key]);
          }
        }
        return partialFragmentResult;
      }
      default:
        return partialFragment;
    }
  }
};
