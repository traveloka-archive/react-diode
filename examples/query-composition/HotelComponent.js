import React from 'react';
import Diode from '../..';
import HotelHeader from './HotelHeader';
import HotelDetailQuery from './HotelDetailQuery';

const HotelComponent = props => {
  return (
    <html>
    <head>
      <title>{props.hotel.name}</title>
      <meta name='description' content={props.hotel.description} />
    </head>
    <body>
      <div className='hotel'>
        <HotelHeader hotel={props.hotel} />
        <div className='hotel-description'>{props.hotel.description}</div>
      </div>
    </body>
    </html>
  );
};

HotelComponent.displayName = 'HotelComponent';
HotelComponent.propTypes = {
  hotel: React.PropTypes.object
};

export default Diode.createRootContainer(HotelComponent, {
  children: [HotelHeader],
  queries: {
    hotel: Diode.createQuery(HotelDetailQuery, {
      id: 1234,
      name: null,
      description: null
    })
  }
});
