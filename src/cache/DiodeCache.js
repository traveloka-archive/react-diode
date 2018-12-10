import React from "react";
import Store from "../store/DiodeStore";

export const CacheContext = React.createContext(null);

class PendingPromise {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

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
        const innerFragmentKeys = Object.keys(
          query.fragmentStructure[fragment]
        );

        if (innerFragmentKeys.length === 0) {
          // TODO fix 2nd load fetch all
          return cache[fragment] === null;
        }

        return innerFragmentKeys.some(key => {
          // API can return null
          if (cache[fragment]) {
            return cache[fragment][key] === undefined;
          }

          return cache[fragment] === undefined;
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

export function createCache(initialCache) {
  return new DiodeCache(initialCache);
}
