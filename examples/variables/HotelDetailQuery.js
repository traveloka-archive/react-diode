import Diode from '../..';

export default {
  type: 'HotelDetail',
  request(fragment, params, options) {
    const url = `/v1/hotel/detail/${fragment.id}`;
    const method = 'get';
    return Diode.queryRequest(url, method);
  },
  resolve(response, fragment, options) {
    return {
      id: fragment.id,
      name: response.data.name
    };
  }
};
