import React from "react";
import Store from "../store/DiodeStore";

export const CacheContext = React.createContext(null);

export const FETCH_ALL_CACHE = "__fac__";

export class DiodeCache {
  constructor(cache, options) {
    Store.cache = cache;
    Store.options = options;
  }

  getContents() {
    return Store.cache;
  }

  // TODO memo
  getUnresolvedQueries(containerQuery) {
    return Object.keys(containerQuery.map).filter(type => {
      const cache = Store.cache[type];
      if (!cache) {
        // have no matching cache
        return true;
      }

      // check for unresolved fragment
      const query = containerQuery.map[type];
      return Object.keys(query.fragmentStructure).some(fragment => {
        const cachedFragment = cache[fragment];
        const innerFragmentKeys = Object.keys(
          query.fragmentStructure[fragment]
        );

        if (innerFragmentKeys.length === 0) {
          if (cachedFragment && typeof cachedFragment === "object") {
            // might already cache fetch-all
            return !cachedFragment[FETCH_ALL_CACHE];
          }

          return cachedFragment === undefined;
        }

        return innerFragmentKeys.some(key => {
          // API can return null
          if (cachedFragment) {
            return cachedFragment[key] === undefined;
          }

          return cachedFragment === undefined;
        });
      });
    });
  }

  hasResolved(containerQuery) {
    return this.getUnresolvedQueries(containerQuery).length === 0;
  }

  async resolve(containerQuery) {
    await Store.fetch(containerQuery);
  }
}

export function createCache(initialCache, options) {
  return new DiodeCache(initialCache, options);
}
