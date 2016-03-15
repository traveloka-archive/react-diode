import Diode from '../..';

export default {
  type: 'HotelDetail',
  request(fragment, params, options) {
    const url = '/v1/hotel/detail';
    const method = 'post';
    const payload = {
      id: fragment.id
    };
    return Diode.queryRequest(url, method, payload);
  },
  resolve(response, fragment, options) {
    return {
      id: fragment.id,
      name: response.data.name,
      rating: response.data.rating,
      description: response.data.description
    };
  }
};
