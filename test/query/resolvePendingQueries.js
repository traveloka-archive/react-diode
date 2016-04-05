import { describe, it } from 'mocha';
import resolvePendingQueries from '../../src/query/resolvePendingQueries';
import chai from 'chai';
import sinon from 'sinon';

chai.should();

describe('resolvePendingQueries', () => {
  it('should call query callback with query dependencies', () => {
    const resolveSpy = sinon.spy();
    const pendingQueries = [
      {
        type: 'pending',
        fragment: null,
        callback(hotel, user) {
          return {
            url: '/api/v1/pending',
            method: 'post',
            payload: {
              hotelId: hotel.id,
              userId: user.id
            }
          };
        },
        dependencies: [
          {
            type: 'hotel'
          },
          {
            type: 'user'
          }
        ],
        resolve: resolveSpy
      }
    ];
    const responseMap = {
      user: {
        id: 2
      },
      hotel: {
        id: 1,
        name: '2'
      }
    };

    const expectedQueries = [
      {
        type: 'pending',
        url: '/api/v1/pending',
        method: 'post',
        fragment: null,
        payload: {
          hotelId: 1,
          userId: 2
        },
        resolve: resolveSpy
      }
    ];

    resolvePendingQueries(
      pendingQueries,
      responseMap
    ).should.deep.equal(expectedQueries);
  });

  it('should not resolve pending query if dependencies not met', () => {
    const resolveSpy = sinon.spy();
    const pendingQueries = [
      {
        type: 'pending',
        fragment: null,
        callback(hotel, user) {
          return {
            url: '/api/v1/pending',
            method: 'post',
            payload: {
              hotelId: hotel.id,
              userId: user.id
            }
          };
        },
        dependencies: [
          {
            type: 'hotel'
          },
          {
            type: 'user'
          }
        ],
        resolve: resolveSpy
      }
    ];
    const responseMap = {
      // missing user response
      hotel: {
        id: 1,
        name: '2'
      }
    };

    resolvePendingQueries(
      pendingQueries,
      responseMap
    ).should.deep.equal(pendingQueries);
  });
});
