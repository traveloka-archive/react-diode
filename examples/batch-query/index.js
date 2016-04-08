import express from 'express';
import bodyParser from 'body-parser';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Diode, { Store, DefaultNetworkLayer } from '../..';
import BatchComponent from './BatchComponent';
import BatchQuery from './BatchQuery';

const PORT = 3000;
const app = express();
app.use(bodyParser.json());

Diode.injectNetworkLayer(
  new DefaultNetworkLayer(`http://localhost:${PORT}`, {
    credentials: 'same-origin'
  })
);

// We tell Diode that some query requests should be merged,
// in this case hotelDetal and helloWorld queries should be
// sent as one payload instead of two parallel requests
Diode.useBatchQuery(BatchQuery);

// Instead of two API for helloWorld and hotelDetail query,
// we only specify one API that will be called with merged payload
app.post('/v1/batch/hotel-hello', (req, res) => {
  const response = {
    data: {
      helloWorld: 'hello, world!',
      hotelDetail: {
        id: 1234,
        name: 'Hotel Rich',
        rating: 4,
        description: 'Rich hotel located in rich village'
      }
    }
  };
  res.json(response).send();
});

// our actual app
app.get('/', (req, res) => {
  Store.forceFetch(BatchComponent).then(rootProps => {
    try {
      const Page = renderToString(<BatchComponent {...rootProps} />);
      res.send(Page);
    } catch (e) {
      res.send(e.stack);
    }
  }).catch(e => res.send(e.stack));
});

app.listen(PORT, () => console.log('App listening at port %d', PORT));
