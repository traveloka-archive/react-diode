import React from 'react';
import Diode from '../..';
import HotelDetailQuery from './HotelDetailQuery';

const HotelHeader = props => {
  return (
    <div className='hotel-header'>
      <div className='hotel-name'>{props.hotel.name}</div>
      <div className='hotel-rating'>{props.hotel.rating}/5</div>
    </div>
  );
};

HotelHeader.displayName = 'HotelHeader';
HotelHeader.propTypes = {
  hotel: React.PropTypes.object
};

export default Diode.createContainer(HotelHeader, {
  queries: {
    hotel: Diode.createQuery(HotelDetailQuery, {
      name: null,
      rating: null
    })
  }
});
