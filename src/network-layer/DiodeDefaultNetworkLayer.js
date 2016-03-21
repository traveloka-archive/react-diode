/**
 * @flow
 */
import fetch from 'isomorphic-fetch';
import type { DiodeQueryRequest } from '../query/DiodeQueryRequest';
import type { DiodeFetchOptions } from '../tools/DiodeTypes';

type NetworkLayerOptions = {
  credentials?: string,
  headers: {
    [key: string]: string
  }
}

class DiodeDefaultNetworkLayer {
  _baseApiEndpoint: string;

  _defaultHeaders: {
    [header: string]: string
  }

  // TODO accept fetch options
  constructor(baseApiEndpoint: string, options: ?NetworkLayerOptions) {
    this._baseApiEndpoint = baseApiEndpoint;
    this._defaultHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  /**
   * @public
   *
   */
  sendQueries(
    queryRequests: Array<DiodeQueryRequest>,
    options: DiodeFetchOptions
  ): Promise {
    const requests = queryRequests.map(query => {
      /* istanbul ignore next */
      const headers = options.headers ? options.headers : this._defaultHeaders;
      const { url, method, payload } = query;
      const apiUrl = `${this._baseApiEndpoint}${url}`;
      const fetchParams = { method, headers };

      if (typeof payload === 'object') {
        // we use JSON.stringify here because this is what most POST request
        // body looked like. GET requests are usually in form of query string
        // which should already handled inside apiUrl. Other type of payload,
        // like urlencodedform should be generated inside query.generate method
        fetchParams.body = JSON.stringify(payload);
      }

      return fetch(apiUrl, fetchParams).then(response => response.json());
    });

    return Promise.all(requests);
  }
}

module.exports = DiodeDefaultNetworkLayer;
