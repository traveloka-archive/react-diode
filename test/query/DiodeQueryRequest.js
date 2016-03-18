import { describe, it } from 'mocha';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  createPendingQueryRequest,
  getQueryRequests
} from '../../src/query/DiodeQueryRequest';

chai.should();
chai.use(sinonChai);

describe('DiodeQueryRequest', () => {
  it('should be able to create a pending query request', () => {
    const QueryShape = {
      type: 'contentResource'
    };
    const callbackSpy = sinon.spy();
    const request = createPendingQueryRequest(QueryShape, callbackSpy);
    request.pending.should.be.equal(true);
    request.dependency.should.be.deep.equal(QueryShape);
    request.callback.should.be.equal(callbackSpy);
  });

  it('should be able to get query requests fro root container', () => {
    const RootContainer = {
      query: {
        compile: sinon.stub()
      }
    };
    const queryMock1 = {
      request: sinon.stub()
    };
    const queryMock2 = {
      request: sinon.stub()
    };
    const queries = [
      queryMock1,
      queryMock2
    ];

    queryMock1.request.returns({ url: '/v1/hotel/detail' });
    queryMock2.request.returns({ url: '/v1/hotel/room' });

    RootContainer.query.compile.returns(queries);
    const requests = getQueryRequests(RootContainer);
    requests.length.should.be.equal(queries.length);
  });
});
