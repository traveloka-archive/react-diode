import React, { PropTypes } from 'react';
import Diode from '../..';
import HotelDetailQuery from './HotelDetailQuery';

const HotelDetailComponent = props => {
  return (
    <div className='hotel'>
      <div className='hotel-name'>{props.hotel.name}</div>
      <div className='hotel-rating'>Rating: {props.hotel.rating}/5</div>
    </div>
  );
};

HotelDetailComponent.displayName = 'HotelDetail';
HotelDetailComponent.propTypes = {
  hotel: PropTypes.shape({
    name: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired
  }).isRequired
};

export default Diode.createContainer(HotelDetailComponent, {
  queries: {
    hotel: Diode.createQuery(HotelDetailQuery, {
      id: 12345,
      name: null,
      rating: null
    })
  }
});
