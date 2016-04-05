import { describe, it } from 'mocha';
import createBatchQueryRequest from '../../src/query/createBatchQueryRequest';
import chai from 'chai';
import sinon from 'sinon';

chai.should();

describe('createBatchQueryRequest', () => {
  it('should create a DiodeQueryRequest', () => {
    const resolveSpy = sinon.spy();
    const BatchQuery = {
      type: 'batch',
      request(queries) {
        return {
          url: '/api/v1/batch',
          method: 'post',
          payload: {
            a: queries[0].payload,
            b: queries[1].payload
          }
        };
      },
      resolve: resolveSpy
    };

    const queryList = [
      {
        type: 'a',
        payload: {
          text: 'hello'
        }
      },
      {
        type: 'b',
        payload: 'world'
      }
    ];

    const expectedQueryRequest = {
      type: 'batch',
      url: '/api/v1/batch',
      method: 'post',
      payload: {
        a: {
          text: 'hello'
        },
        b: 'world'
      },
      resolve: resolveSpy
    };

    createBatchQueryRequest(
      BatchQuery,
      queryList,
    ).should.deep.equal(expectedQueryRequest);
  });
});
