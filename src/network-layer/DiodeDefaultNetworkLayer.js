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
    const requests = this._sendRequests(queryRequests, options);

    return Promise.all(requests).then(responses => {
      return responses.reduce((result, response) => {
        result[response.type] = response.data;
        return result;
      }, {});
    });
  }

  _sendRequests(
    queryRequests: Array<DiodeQueryRequest>,
    options: DiodeFetchOptions
  ): Promise {
    return queryRequests.map(query => {
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

      return fetch(apiUrl, fetchParams)
      .then(response => response.json())
      .then(response => {
        // modify response with query type so in the end we can convert
        // this query response into Map<queryType, responseData>
        // which is exactly what Diode wants
        return {
          type: query.type,
          data: query.resolve(response, query.fragment, options)
        };
      });
    });
  }
}

module.exports = DiodeDefaultNetworkLayer;
