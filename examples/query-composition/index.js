import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Diode, { Store, DefaultNetworkLayer } from '../..';
import HotelComponent from './HotelComponent';

const PORT = 3000;
const app = express();

Diode.injectNetworkLayer(
  new DefaultNetworkLayer(`http://localhost:${PORT}`, {
    credentials: 'same-origin'
  })
);

app.post('/v1/hotel/detail', (req, res) => {
  const response = {
    status: 'ok',
    data: {
      name: 'Bugenvilla',
      rating: 3.75,
      description: 'Bugenvilla is a fake hotel located in unknown location'
    }
  };
  res.json(response).send();
});

// main()
app.get('/', (req, res) => {
  Store.forceFetch(HotelComponent).then(rootProps => {
    try {
      const response = renderToString(<HotelComponent {...rootProps} />);
      res.send(response);
    } catch (e) {
      res.send(e.stack);
    }
  }).catch(e => res.send(e.stack));
});

app.listen(PORT, () => console.log('App listening at port %d', PORT));
