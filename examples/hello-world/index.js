import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Diode, { Store, DefaultNetworkLayer } from '../..';
import HelloWorldComponent from './HelloWorldComponent';

const PORT = 3000;
const app = express();

Diode.injectNetworkLayer(
  new DefaultNetworkLayer(`http://localhost:${PORT}`, {
    credentials: 'same-origin'
  })
);

// Our custom API endpoint
app.get('/api/hello-world/:name', (req, res) => {
  const response = {
    status: 'ok',
    data: {
      text: `Hello world, ${req.params.name}`
    }
  };

  res.json(response).send();
});

// our actual app
app.get('/', (req, res) => {
  Store.forceFetch(HelloWorldComponent).then(rootProps => {
    try {
      const Page = renderToString(<HelloWorldComponent {...rootProps} />);
      res.send(Page);
    } catch (e) {
      res.send(e.stack);
    }
  }).catch(e => res.send(e.stack));
});

app.listen(PORT, () => console.log('App listening at port %d', PORT));
