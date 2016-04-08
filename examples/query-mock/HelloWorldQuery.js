import Diode from '../..';

export default {
  type: 'HelloWorld',
  request(fragment, params, options) {
    const url = `/api/hello-world/${fragment.world}`;
    const method = 'get';
    return Diode.queryRequest(url, method);
  },
  resolve(response, fragment, options) {
    return {
      world: response.data.text
    };
  }
};
