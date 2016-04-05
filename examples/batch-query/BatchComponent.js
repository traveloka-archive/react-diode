import React, { PropTypes } from 'react';
import Diode from '../..';
import HelloWorldComponent from './HelloWorldComponent';
import HotelDetailComponent from './HotelDetailComponent';

const BatchComponent = props => {
  return (
    <div className='batch'>
      <HelloWorldComponent hello={props.hello} />
      <HotelDetailComponent hotel={props.hotel} />
    </div>
  );
};

BatchComponent.displayName = 'BatchComponent';
BatchComponent.propTypes = {
  hello: PropTypes.object.isRequired,
  hotel: PropTypes.object.isRequired
};

export default Diode.createRootContainer(BatchComponent, {
  children: [HelloWorldComponent, HotelDetailComponent]
});
