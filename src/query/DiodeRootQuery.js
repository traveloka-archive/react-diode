import deepExtend from 'deep-extend';
import type DiodeContainerQuery from './DiodeContainerQuery';
import type { DiodeQuery, Variables } from '../tools/DiodeTypes';

/**
 * Represent complete query in Diode.RootContainer
 *
 */
class DiodeRootQuery {
  _variables: Variables = {};
  _containerQuery: DiodeContainerQuery;

  constructor(containerQuery: DiodeContainerQuery) {
    this._containerQuery = containerQuery;
  }

  /**
   * @public
   *
   */
  setVariables(variables: Variables): void {
    deepExtend(this._variables, variables);
  }

  /**
   * @public
   *
   */
  getVariables(): Variables {
    return this._variables;
  }

  /**
   * @public
   *
   * Compile query map into an array of actionable query and apply fragment
   * values from .setVariables() method (if any)
   */
  compile(): Array<DiodeQuery> {
    const queryTypeMap = this._containerQuery.getQueryTypeMap();

    return Object.keys(queryTypeMap).map(queryType => {
      const query = queryTypeMap[queryType];
      query.fragment = this._compileFragmentKeys(query.fragmentStructure);
      return query;
    });
  }

  /**
   * Iterate over fragment structure keys and compile the value.
   * If an object is found, recursively iterate the object keys
   */
  _compileFragmentKeys(rawFragment: any): any {
    return Object.keys(rawFragment).reduce((fragment, key) => {
      // typeof null === 'object'
      if (typeof rawFragment[key] === 'object' && rawFragment[key] !== null) {
        fragment[key] = this._compileFragmentKeys(rawFragment[key]);
      } else {
        fragment[key] = this._compileFragmentValue(rawFragment[key]);
      }

      return fragment;
    }, {});
  }

  /**
   * Replace value format with actual value from stored value map
   */
  _compileFragmentValue(rawFragment: any): any {
    if (typeof rawFragment === 'string' && rawFragment.charAt(0) === '$') {
      const key = rawFragment.slice(1);
      const value = this._variables[key];

      // If value not found from value map, return as is.
      // Do not use boolean coercion here as it's possible we have
      // falsy value like 0 and ''
      if (typeof value === 'undefined' || value === null) {
        return rawFragment;
      }

      return value;
    }

    return rawFragment;
  }
}

module.exports = DiodeRootQuery;
