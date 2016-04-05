import React, { PropTypes } from 'react';
import Diode from '../..';
import HelloWorldQuery from './HelloWorldQuery';

const HelloWorldComponent = props => {
  return (
    <div>{props.hello.world}</div>
  );
};

HelloWorldComponent.displayName = 'HelloWorld';
HelloWorldComponent.propTypes = {
  hello: PropTypes.shape({
    world: PropTypes.string.isRequired
  }).isRequired
};

export default Diode.createContainer(HelloWorldComponent, {
  queries: {
    hello: Diode.createQuery(HelloWorldQuery, {
      world: 'Jane Doe'
    })
  }
});
