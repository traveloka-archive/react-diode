/**
 * @flow
 */
import fetch from 'isomorphic-fetch';
import type { DiodeQueryRequest } from '../query/DiodeQueryRequest';

type NetworkLayerOptions = {
  credentials?: string,
  headers: {
    [key: string]: string
  }
}

type FetchParams = {
  headers: {
    [key: string]: string
  },
  method: string,
  body?: string
}

class DiodeDefaultNetworkLayer {
  _baseApiEndpoint: string;

  _defaultHeaders: {
    [header: string]: string
  };

  // TODO accept fetch options
  constructor(
    baseApiEndpoint: string,
    options: ?NetworkLayerOptions
  ) {
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
    options: any
  ): Promise {
    const requests = queryRequests.map(query => {
      /* istanbul ignore next */
      const headers = options.headers ? options.headers : this._defaultHeaders;
      const { url, method, payload } = query;
      const apiUrl = `${this._baseApiEndpoint}${url}`;
      const fetchParams: FetchParams = {
        method,
        headers: {
          ...headers,
          ...query.headers
        }
      };

      /* istanbul ignore else */
      if (typeof payload === 'object') {
        // we use JSON.stringify here because this is what most POST request
        // body looked like. GET requests are usually in form of query string
        // which should already handled inside apiUrl. Other type of payload,
        // like urlencodedform should be generated inside query.generate method
        fetchParams.body = JSON.stringify(payload);
      } else if (typeof payload === 'string') {
        fetchParams.body = payload;
      }

      return fetch(apiUrl, fetchParams).then(response => response.json());
    });

    return Promise.all(requests).then(responses => {
      // Convert array of response into Map<QueryType, QueryResponse>
      return responses.reduce((responseMap, response, id) => {
        const { type } = queryRequests[id];
        responseMap[type] = response;
        return responseMap;
      }, {});
    });
  }
}

module.exports = DiodeDefaultNetworkLayer;
