import Diode from '../..';
import UserQuery from './UserQuery';

export default {
  type: 'UserBooking',
  request(fragment, params, options) {
    // By using Diode.waitForQuery, UserBookingQuery will not be fetched
    // before UserQuery is successfully fetched
    return Diode.waitForQuery(UserQuery, user => {
      const url = '/v1/user/booking';
      const method = 'post';
      const payload = {
        transactionId: user.userTransactionId
      };
      return Diode.queryRequest(url, method, payload);
    });
  },
  resolve(response, fragment, options) {
    // fragment is an array to show the return type
    const shape = fragment[0];

    // match query shape
    return response.data.map(booking => {
      return Object.keys(shape).reduce((result, key) => {
        result[key] = booking[key];
        return result;
      }, {});
    });
  }
};
