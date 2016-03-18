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
      query: {}
    };
    const queryRequestsMock = [
      {
        fragment: {}
      }
    ];
    const responseMock = {
      contentResource: {
        SimpleSentence: {
          login: 'Masuk'
        }
      }
    };

    const gqStub = sinon.stub(DiodeQueryRequest, 'getQueryRequests');
    const sqStub = sinon.stub(DiodeNetworkLayer.prototype, 'sendQueries');
    gqStub.withArgs(RootContainer).returns(queryRequestsMock);
    sqStub.withArgs(
      queryRequestsMock,
      {}
    ).returns(Promise.resolve(responseMock));

    Store.forceFetch(RootContainer).then(response => {
      const expectedResponse = {
        __diodeResponse: {
          contentResource: {
            SimpleSentence: {
              login: 'Masuk'
            }
          }
        }
      };
      response.should.be.deep.equal(expectedResponse);
      gqStub.restore();
      sqStub.restore();
      done();
    });
  });

  it('should resolve query dependency', done => {
    const RootContainer = {
      query: {}
    };
    const opts = {};
    const queryRequest1 = {
      type: 'hotelDetail',
      fragment: {
        id: 123
      }
    };
    const queryRequest2 = {
      type: 'hotelRoom',
      pending: true,
      dependency: {
        type: 'hotelDetail'
      },
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
      ...queryRequest2.callback({ roomId: 5678 })
    };

    const hotelDetailResponseMock = {
      hotelDetail: {
        id: 1234,
        roomId: 5678
      }
    };
    const hotelRoomResponseMock = {
      hotelRoom: {
        id: 5678,
        name: 'Deluxe Room'
      }
    };

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

    Store.forceFetch(RootContainer, opts).then(response => {
      const expectedResponse = {
        __diodeResponse: {
          hotelDetail: {
            id: 1234,
            roomId: 5678
          },
          hotelRoom: {
            id: 5678,
            name: 'Deluxe Room'
          }
        }
      };

      response.should.be.deep.equal(expectedResponse);
      gqStub.restore();
      sqStub.restore();
      done();
    });
  });
});
