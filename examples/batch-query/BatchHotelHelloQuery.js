import Diode from '../../';
import HelloWorldQuery from './HelloWorldQuery';
import HotelDetailQuery from './HotelDetailQuery';

const { type: helloWorldType } = HelloWorldQuery;
const { type: hotelDetailType } = HotelDetailQuery;

import type DiodeQueryRequest from '../../src/query/DiodeQueryRequest';

export default {
  // Batch query should have query type equal to Diode.QueryTypes.BATCH
  // and a unique name
  type: Diode.QueryTypes.BATCH,
  name: 'BatchHotelHello',

  // Declare which query types should be merged one into batch query
  // The order of query types will be used to determine the order of
  // queries argument in request() method
  queryTypes: [helloWorldType, hotelDetailType],

  // Instead of fragment, params, and options, this method only receive
  // two arguments, queries and options
  request(
    queries: Array<DiodeQueryRequest>,
    options: any
  ): DiodeQueryRequest {
    const url = '/v1/batch/hotel-hello';
    const method = 'post';
    const payload = {
      data: {
        helloWorld: queries[0].payload.text,
        hotel: queries[1].payload
      }
    };
    return Diode.queryRequest(url, method, payload);
  },

  // Batch query resolve method also different from normal query
  // resolve method, here you receive response and options arguments,
  // the return value also not directly used as props in component
  resolve(response, options) {
    // Return Map<queryType, queryResponse>
    // This response will be used in each query resolve function,
    // so make sure that you return the expected response for each query
    return {
      [helloWorldType]: {
        data: {
          text: response.data.helloWorld
        }
      },
      [hotelDetailType]: {
        data: response.data.hotelDetail
      }
    };
  }
};
