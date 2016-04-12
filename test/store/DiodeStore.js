import { describe, it } from 'mocha';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Store from '../../src/store/DiodeStore';
import DiodeNetworkLayer from '../../src/network/DiodeNetworkLayer';
import * as DiodeQueryRequest from '../../src/query/DiodeQueryRequest';
import DiodeQueryTypes from '../../src/query/DiodeQueryTypes';
import * as FilterBatchQuery from '../../src/query/filterBatchQuery';

chai.should();
chai.use(sinonChai);

describe('DiodeStore', () => {
  it('should allow network layer injection', () => {
    const net = sinon.stub(DiodeNetworkLayer.prototype, 'injectNetworkLayer');
    const networkLayer = {};
    Store.injectNetworkLayer(networkLayer);
    net.should.be.calledWith(networkLayer);
    net.restore();
  });

  it('should allow enabling query mock', () => {
    const qmr = sinon.stub(
      DiodeNetworkLayer.prototype,
      'injectQueryMockResolver'
    );
    const queryMockResolver = {};
    Store.useMockQueries(queryMockResolver);
    qmr.should.be.calledWith(queryMockResolver);
    qmr.restore();
  });

  it('should call getQueryRequests with correct arguments', () => {
    const RootContainer = {};
    const options = {};
    const getQueryRequests = sinon.stub(DiodeQueryRequest, 'getQueryRequests');
    const fetchQueries = sinon.stub(Store, '_fetchQueries');
    fetchQueries.returns(Promise.resolve({}));
    Store.forceFetch(RootContainer, options);
    getQueryRequests.should.be.calledWithExactly(RootContainer, options);
    getQueryRequests.restore();
    fetchQueries.restore();
  });

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
    const responseMock = {
      contentResource: {
        data: {
          SimpleSentence: {
            login: 'Masuk'
          }
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

    const hotelDetailResponseMock = {
      hotelDetail: {
        data: {
          id: 1234,
          roomId: 5678
        }
      }
    };
    const hotelRoomResponseMock = {
      hotelRoom: {
        data: {
          id: 5678,
          name: 'Deluxe Room'
        }
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
    });
  });

  it('should allow batch query', done => {
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
      fragment: {
        hotelId: 123
      },
      resolve(response, fragment, options) {
        return response.data;
      }
    };
    const batchQuery = {
      type: DiodeQueryTypes.BATCH,
      name: 'hotelBatch',
      queryTypes: ['hotelDetail', 'hotelRoom'],
      request(queries, options) {
      },
      resolve(response, options) {
        return {
          hotelDetail: {
            data: response.data.detail
          },
          hotelRoom: {
            data: response.data.room
          },
          __additional: {
            included: 'yes',
            alsoIncluded: true
          }
        };
      }
    };
    const batchQueryRequest = {
      type: batchQuery.type,
      resolve: batchQuery.resolve
    };
    const batchResponseMock = {
      [DiodeQueryTypes.BATCH]: {
        data: {
          detail: {
            id: 1234,
            name: 'Hotel Rich'
          },
          room: {
            id: 5678,
            name: 'Deluxe Room'
          }
        }
      }
    };

    const queryRequests = [queryRequest1, queryRequest2];
    const batchQueryRequests = [batchQueryRequest];

    const gqStub = sinon.stub(DiodeQueryRequest, 'getQueryRequests');
    const sqStub = sinon.stub(DiodeNetworkLayer.prototype, 'sendQueries');
    const fbqSpy = sinon.spy(FilterBatchQuery, 'filterBatchQuery');
    gqStub.withArgs(RootContainer).returns(queryRequests);
    sqStub.withArgs(
      batchQueryRequests,
      opts
    ).returns(Promise.resolve(batchResponseMock));

    Store.useBatchQuery(batchQuery);
    Store.forceFetch(RootContainer, opts).then(props => {
      const expectedProps = {
        hotel: {
          id: 1234,
          name: 'Hotel Rich'
        },
        hotelRoom: {
          id: 5678,
          name: 'Deluxe Room'
        },
        __additional: {
          included: 'yes',
          alsoIncluded: true
        }
      };

      fbqSpy.should.be.calledWithExactly(
        queryRequests,
        batchQuery,
        opts
      );
      props.should.be.deep.equal(expectedProps);
      fbqSpy.restore();
      gqStub.restore();
      sqStub.restore();
      done();
    });
  });
});
