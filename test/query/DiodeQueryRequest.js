import { describe, it } from 'mocha';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  createQueryRequest,
  createPendingQueryRequest,
  getQueryRequests
} from '../../src/query/DiodeQueryRequest';

chai.should();
chai.use(sinonChai);

describe('DiodeQueryRequest', () => {
  it('should be able to create a query request', () => {
    const url = '/api/v1/content';
    const method = 'post';
    const payload = { text: 'hello' };

    const request = createQueryRequest(url, method, payload);
    request.should.be.deep.equal({
      pending: false,
      url,
      method,
      payload
    });
  });

  it('should be able to create a pending query request', () => {
    const QueryShape = {
      type: 'contentResource'
    };
    const callbackSpy = sinon.spy();
    const request = createPendingQueryRequest(QueryShape, callbackSpy);

    request.should.be.deep.equal({
      pending: true,
      dependencies: [QueryShape],
      callback: callbackSpy
    });
  });

  it('should be able to create a parallel pending query request', () => {
    const QueryShape1 = {
      type: 'contentResource'
    };
    const QueryShape2 = {
      type: 'imageResource'
    };
    const callbackSpy = sinon.spy();
    const request = createPendingQueryRequest(
      [
        QueryShape1,
        QueryShape2
      ],
      callbackSpy
    );

    request.dependencies.should.be.deep.equal([QueryShape1, QueryShape2]);
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
