import Diode from '../..';

export default {
  type: 'UserQuery',
  request(fragment, params, options) {
    const url = `/v1/user/${fragment.id}`;
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
