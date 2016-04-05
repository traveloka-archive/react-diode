import React, { PropTypes } from 'react';
import Diode from '../..';
import HelloWorldQuery from './HelloWorldQuery';

// Here we define our component like a normal React component,
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

// Instead of exporting the component directly, we export a diode container
// that encapsulates the component and its data requirement.
export default Diode.createRootContainer(HelloWorldComponent, {
  // queries is a Map<string, DiodeQuery> created using Diode.createQuery
  queries: {
    hello: Diode.createQuery(HelloWorldQuery, {
      world: 'Jane Doe'
    })
  }
});
