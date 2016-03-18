import React from 'react';
import Diode from '../..';
import UserBookingHistory from './UserBookingHistory';
import UserQuery from './UserQuery';

const UserComponent = props => {
  return (
    <div>
      <h1>{props.user.name}</h1>
      <UserBookingHistory bookings={props.bookings} />
    </div>
  );
};

UserComponent.displayName = 'UserComponent';
UserComponent.propTypes = {
  user: React.PropTypes.object,
  bookings: React.PropTypes.array
};

export default Diode.createRootContainer(UserComponent, {
  children: [UserBookingHistory],
  queries: {
    user: Diode.createQuery(UserQuery, {
      id: 1234,
      name: null
    })
  }
});
