# react-diode

> Endpoint agnostic, unidirectional data fetching for React application

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
