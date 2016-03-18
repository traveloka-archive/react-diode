import React, { PropTypes } from 'react';
import Diode from '../..';
import HelloWorldQuery from './HelloWorldQuery';

const HelloWorldComponent = props => {
  return (
    <html>
    <head>
      <title>Hello World</title>
    </head>
    <body>
      { /* should output Hello World, Jane Doe */ }
      <div>{props.hello.world}</div>
    </body>
    </html>
  );
};

HelloWorldComponent.displayName = 'HelloWorld';
HelloWorldComponent.propTypes = {
  hello: PropTypes.shape({
    world: PropTypes.string.isRequired
  }).isRequired
};

export default Diode.createRootContainer(HelloWorldComponent, {
  queries: {
    hello: Diode.createQuery(HelloWorldQuery, {
      world: 'Jane Doe'
    })
  }
});
