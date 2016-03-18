import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Diode, { Store, DefaultNetworkLayer } from '../..';
import UserComponent from './UserComponent';

const PORT = 3000;
const app = express();

Diode.injectNetworkLayer(
  new DefaultNetworkLayer(`http://localhost:${PORT}`, {
    credentials: 'same-origin'
  })
);

app.get('/v1/user/:userId', (req, res) => {
  const response = {
    status: 'ok',
    data: {
      name: 'Patih Gajahmada',
      userTransactionId: 52437
    }
  };
  res.json(response).send();
});

app.post('/v1/user/booking', (req, res) => {
  const response = {
    status: 'ok',
    data: [
      {
        id: 1,
        title: 'Flight booking from JKTA to SIN',
        amount: 450000,
        currency: 'IDR'
      },
      {
        id: 2,
        title: 'Hotel Booking in Sheraton',
        amount: 450,
        currency: 'SGD'
      }
    ]
  };

  res.json(response).send();
});

// main()
app.get('/', (req, res) => {
  Store.forceFetch(UserComponent).then(rootProps => {
    try {
      const response = renderToString(<UserComponent {...rootProps} />);
      res.send(response);
    } catch (e) {
      res.send(e.stack);
    }
  }).catch(e => res.send(e.stack));
});

app.listen(PORT, () => console.log('App listening at port %d', PORT));
