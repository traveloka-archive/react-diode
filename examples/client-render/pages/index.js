import Diode from "../../../";

import FakeNetworkLayer from "../../shared/FakeNetworkLayer";
import ContentResourceQuery from "../../shared/ContentResourceQuery";

Diode.injectNetworkLayer(new FakeNetworkLayer());

const ChildComponent = props => {
  return <div>{props.contentResource.hello.world}</div>;
};

const AnotherComponent = props => {
  return <div>{props.contentResource.new.world}</div>;
};

const ChildContainer = Diode.createRootContainer(ChildComponent, {
  queries: {
    contentResource: Diode.createQuery(ContentResourceQuery, {
      hello: {
        world: null
      }
    })
  }
});

const AnotherContainer = Diode.createRootContainer(AnotherComponent, {
  queries: {
    contentResource: Diode.createQuery(ContentResourceQuery, {
      new: {
        world: null
      }
    })
  }
});

export default class Page extends React.Component {
  state = {
    clicked: false
  };

  static async getInitialProps(ctx) {
    if (ctx.req) {
      const cache = await Diode.Store.forceFetch(ChildContainer);
      return { cache };
    }

    // get cache from window
    return { cache: window.__NEXT_DATA__.props.pageProps };
  }

  constructor(props) {
    super(props);
    this.cache = Diode.createCache(props.cache);
  }

  handleClick = () => {
    this.setState(state => ({ clicked: !state.clicked }));
  };

  render() {
    const Component = this.state.clicked ? AnotherContainer : ChildContainer;

    return (
      <Diode.CacheProvider value={this.cache}>
        <div>
          <Component />
          <button onClick={this.handleClick}>Click me!</button>
        </div>
      </Diode.CacheProvider>
    );
  }
}
