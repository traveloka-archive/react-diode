# Diode

> Endpoint agnostic, unidirectional data fetching for React application

## Motivation

We love [Relay](https://facebook.github.io/relay), but converting all of our APIs into
[GraphQL](https://facebook.github.io/graphql) takes time. and some APIs are still
awkward to be expressed into GraphQL schema (for example our translation API). So we built Diode
by taking what's best from Relay and removing what doesn't work for us.

**Diode is an early project, expect breaking changes every (minor) version update.**

## Features

- **Declarative**

  Declare your data requirements declaratively, no need to manually call API in `componentDidMount`
  and use `this.state` to store data from server. All your data will be available as props.

- **Colocation**

  Query next to views that rely on them. See your data requirement in the same place
  that your view resides.

- **Endpoint agnostic**

  Every query will have its own endpoint and configuration on how to call them. You can use any
  HTTP-based endpoint, including REST and yes, GraphQL.

- **Batched query**

  For some reason you may want for some queries to be sent as one payload, while still declaring data in your component using single query.

## Install

```
$ npm install react-diode
```

## Usage example

Currently only work in server side rendering, roughly like this:

*App.js*
```js
import React from 'react';
import Diode from 'react-diode';
import HelloWorldQuery from './queries/HelloWorldQuery';

// react v0.14 stateless component
let AppComponent = props => {
  // guaranteed to have props = { hello: { world: 'Hello World, Diode!' }}
  return (
    <h1>{props.hello.world}</h1>
  );
};

// create HOC that wraps original component and export that instead
export default Diode.createContainer(AppComponent, {
  queries: {
    // define query requirement
    hello: Diode.Query.create(HelloWorldQuery, {
      world: 'Diode'
    })    
  }
});
```

*server.js*
```js
import express from 'express';
import ReactDOMServer from 'react-dom/server';
import Diode from 'react-diode';
import App from './components/App';

let app = express();
let options = {};

app.get('/', function(req, res) {
  Diode.fetchData(App, options).then(diodeResponse => {
    let response = ReactDOMServer.renderToStaticMarkup(App, { diodeResponse });

    res.send(response);
  });  
})
```

## Query

Query is how you define your data requirement inside your component. Looking at previous example,
the query is defined like this

*HelloWorldQuery.js*
```js
const QUERY_TYPE = 'helloWorld';

export default {
  type: QUERY_TYPE,
  method: 'post',
  endpoint(options) {
    return `${options.apiDomain}/v1/hello/world`;
  },
  generate(fragment, options) {
    // fragment is what you declare in your requirement
    // transform here to match your API payload contract
    //
    // console.log(fragment)
    // { world: 'Diode' }
    return {
      data: {
        name: fragment.world
      },
      token: options.apiToken
    };
  },
  resolve(response) {
    // console.log(response)
    // { body: { text: 'Hello World, Diode!'} }
    return {
      type: QUERY_TYPE,
      // transform your API response here to match data requirement
      data: {
        hello: {
          world: response.body.text
        }
      }
    };
  }
};
```

## Query composition

Diode also support query composition between parent and child container. Simply use `children`
property when creating container:

```js
import ChildComponent from './child';

const ParentComponent = props => {
  return (
    <div>
      <ChildComponent diodeResponse={props.diodeResponse} />
    </div>
  )
};

export default Diode.createContaier(ParentComponent, {
  children: [ChildComponent]
  queries: {
    ...
  }
})
```

Pass diodeResponse props from parent component to child component to make sure that child component
also have the required data.

## License

MIT
