import Diode from '../..';

export default {
  type: 'HelloWorld',
  request(fragment, params, options) {
    const url = '/api/hello-world';
    const method = 'get';
    const payload = {
      text: fragment.world
    };
    return Diode.queryRequest(url, method, payload);
  },
  resolve(response, fragment, options) {
    return {
      world: response.data.text
    };
  }
};
