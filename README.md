# react-diode (alpha)

> Endpoint agnostic, unidirectional data fetching for React application

## Install

```
$ npm install react-diode
```

## Usage example

Currently only work in server side rendering, roughly like this:

```js
import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Diode from 'react-diode';
import HelloWorldQuery from './queries/HelloWorldQuery';

let app = express();

let AppComponent = () => {
  // guaranteed to have props = { hello: { world: 'Hello World' }}
  return (
    <div>{this.props.hello.world}</div>
  );
};

let App = Diode.createContainer(AppComponent, {
  queries: {
    hello: new HelloWorldQuery({
      world: null
    })    
  }
});

let options = {};

app.get('/', function(req, res) {
  // for now we still run .fetchData() manually
  Diode.fetchData(App, options).then(diodeResponse => {
    let response = ReactDOMServer.renderToStaticMarkup(App, { diodeResponse });

    res.send(response);
  });  
})
```

## TODO

- [ ] Render trigger fetch data automatically
- [ ] Client side implementation

## License

MIT
