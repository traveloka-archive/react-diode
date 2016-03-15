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

// faux db
const hoteldb = {
  1: {
    name: 'Hotel Permata'
  },
  2: {
    name: 'Hotel Kedua'
  },
  3: {
    name: 'Hotel #'
  },
  default: {
    name: 'Hotel misterius'
  }
};

app.get('/v1/hotel/detail/:hotelId', (req, res) => {
  const { hotelId } = req.params;
  let hotel = hoteldb[hotelId];

  if (!hotel) {
    hotel = hoteldb.default;
  }

  const response = {
    status: 'ok',
    data: hotel
  };

  res.json(response).send();
});

// main()
app.get('/hotel/detail/:hotelId', (req, res) => {
  HotelComponent.query.setVariables({
    hotelId: parseInt(req.params.hotelId, 10)
  });

  Store.forceFetch(HotelComponent).then(rootProps => {
    try {
      const response = renderToString(<HotelComponent {...rootProps} />);
      res.send(response);
    } catch (e) {
      res.send(e.stack);
    }
  }).catch(e => {
    res.send(e.stack);
  });
});

app.listen(PORT, () => console.log('App listening at port %d', PORT));
