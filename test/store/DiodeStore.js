import { describe, it } from 'mocha';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Store from '../../src/store/DiodeStore';
import DiodeNetworkLayer from '../../src/network/DiodeNetworkLayer';
import * as DiodeQueryRequest from '../../src/query/DiodeQueryRequest';

chai.should();
chai.use(sinonChai);

describe('DiodeStore', () => {
  it('should be able to send query via network layer', done => {
    const RootContainer = {
      query: {
        getContainerQuery() {
          return {
            map: {
              cr: {
                type: 'contentResource'
              }
            }
          };
        }
      }
    };
    const queryRequestsMock = [
      {
        type: 'contentResource',
        fragment: {},
        resolve(response, fragment, options) {
          return response.data;
        }
      }
    ];
    const responseMock = [
      {
        data: {
          SimpleSentence: {
            login: 'Masuk'
          }
        }
      }
    ];

    const gqStub = sinon.stub(DiodeQueryRequest, 'getQueryRequests');
    const sqStub = sinon.stub(DiodeNetworkLayer.prototype, 'sendQueries');
    gqStub.withArgs(RootContainer).returns(queryRequestsMock);
    sqStub.withArgs(
      queryRequestsMock,
      {}
    ).returns(Promise.resolve(responseMock));

    Store.forceFetch(RootContainer).then(props => {
      const expectedProps = {
        cr: {
          SimpleSentence: {
            login: 'Masuk'
          }
        }
      };
      props.should.be.deep.equal(expectedProps);
      gqStub.restore();
      sqStub.restore();
      done();
    });
  });

  it('should resolve query dependency', done => {
    const RootContainer = {
      query: {
        getContainerQuery() {
          return {
            map: {
              hotel: {
                type: 'hotelDetail'
              },
              hotelRoom: {
                type: 'hotelRoom'
              }
            }
          };
        }
      }
    };
    const opts = {};
    const queryRequest1 = {
      type: 'hotelDetail',
      fragment: {
        id: 123
      },
      resolve(response, fragment, options) {
        return response.data;
      }
    };
    const queryRequest2 = {
      type: 'hotelRoom',
      resolve(response, fragment, options) {
        return response.data;
      },
      dependencies: [
        {
          type: 'hotelDetail'
        }
      ],
      dependencyMap: {
        hotelDetail: 0
      },
      resolvedDependencies: [],
      callback(hotel) {
        return {
          payload: {
            id: hotel.roomId
          }
        };
      }
    };
    const queryRequest2Resolved = {
      type: queryRequest2.type,
      fragment: queryRequest2.fragment,
      resolve: queryRequest2.resolve,
      payload: {
        id: 5678
      }
    };

    const hotelDetailResponseMock = [
      {
        data: {
          id: 1234,
          roomId: 5678
        }
      }
    ];
    const hotelRoomResponseMock = [
      {
        data: {
          id: 5678,
          name: 'Deluxe Room'
        }
      }
    ];

    const queryRequestsMock = [queryRequest1, queryRequest2];
    const queryRequestMock1 = [queryRequest1];
    const queryRequestMock2 = [queryRequest2Resolved];

    const gqStub = sinon.stub(DiodeQueryRequest, 'getQueryRequests');
    const sqStub = sinon.stub(DiodeNetworkLayer.prototype, 'sendQueries');
    gqStub.withArgs(RootContainer).returns(queryRequestsMock);
    sqStub.withArgs(
      queryRequestMock1,
      opts
    ).returns(Promise.resolve(hotelDetailResponseMock));
    sqStub.withArgs(
      queryRequestMock2,
      opts
    ).returns(Promise.resolve(hotelRoomResponseMock));

    Store.forceFetch(RootContainer, opts).then(props => {
      const expectedProps = {
        hotel: {
          id: 1234,
          roomId: 5678
        },
        hotelRoom: {
          id: 5678,
          name: 'Deluxe Room'
        }
      };

      props.should.be.deep.equal(expectedProps);
      gqStub.restore();
      sqStub.restore();
      done();
    }).catch(err => console.error(err.stack));
  });
});
