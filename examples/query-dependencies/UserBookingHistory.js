import React from 'react';
import Diode from '../..';
import UserBookingQuery from './UserBookingQuery';

const UserBookingHistory = props => {
  return (
    <div className='user-booking'>
      <strong>Bookings: </strong>
      {props.bookings.map(booking => {
        return (
          <div key={booking.id} className='user-booking-entry'>
            <span>{booking.title}</span>
          </div>
        );
      })}
    </div>
  );
};

UserBookingHistory.displayName = 'UserBookingHistory';
UserBookingHistory.propTypes = {
  bookings: React.PropTypes.array
};

export default Diode.createContainer(UserBookingHistory, {
  queries: {
    // user booking fragment is an array instead of an object
    // to show that it also returns an array
    bookings: Diode.createQuery(UserBookingQuery, [
      {
        id: null,
        title: null
        // UserBookingQuery also have 'amount' and 'currency'
        // but it will not be displayed because it's not requested
        //
        // amount: null
        // currency: null
      }
    ])
  }
});
