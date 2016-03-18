import React from 'react';
import Diode from '../..';
import HotelDetailQuery from './HotelDetailQuery';

const HotelComponent = props => {
  return (
    <div className='hotel'>
      <h2 className='hotel-name'>{props.hotel.name}</h2>
    </div>
  );
};

HotelComponent.displayName = 'HotelComponent';
HotelComponent.propTypes = {
  hotel: React.PropTypes.object
};

export default Diode.createRootContainer(HotelComponent, {
  queries: {
    hotel: Diode.createQuery(HotelDetailQuery, {
      // this value only known at render time after parsing url
      id: '$hotelId',
      name: null
    })
  }
});
