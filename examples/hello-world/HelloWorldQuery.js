import Diode from '../..';

export default {
  // Every diode query has a unique type that is used to merge all query
  // fragments with the same query type. All fragment object are merged using
  // deep-extend package, with parent fragment overrides child fragment with
  // the same property name
  type: 'HelloWorld',
  // A query also have a request method to return how you would send your
  // query to the server, you can specify url, method, and (optional) payload
  // object using Diode.queryRequest(url, method, opt_payload)
  request(fragment, params, options) {
    const url = `/api/hello-world/${fragment.world}`;
    const method = 'get';
    return Diode.queryRequest(url, method);
  },
  // After receiving response, use resolve() method to parse the response from
  // your server to match the fragment shape. You can still access your query
  // original fragment here
  resolve(response, fragment, options) {
    // Note that even though the component will need props.hello.world, we
    // didn't need to specify the "hello" property here as it's already
    // stored as query key that will automatically be added in final props
    // resolution
    return {
      world: response.data.text
    };
  }
};
