import React from "react";
import Diode from "react-diode";

import { ExampleApp, FakeNetworkLayer } from "@diode/example";
import { HelloWorld } from "@diode/example";

Diode.injectNetworkLayer(new FakeNetworkLayer());

export default class Page extends React.Component {
  static async getInitialProps(ctx) {
    if (ctx.req) {
      const cache = await Diode.Store.forceFetch(HelloWorld);
      return { cache };
    }

    // get cache from props
    return { cache: this.props.cache };
  }

  constructor(props) {
    super(props);
    this.cache = Diode.createCache(props.cache);
  }

  render() {
    return <ExampleApp cache={this.cache} />;
  }
}
