import { describe, it } from 'mocha';
import filterBatchQuery from '../../src/query/filterBatchQuery';
import chai from 'chai';
import sinon from 'sinon';

chai.should();

describe('filterBatchQuery', () => {
  it('should filter some queries as BatchQuery', () => {
    const resolveSpy = sinon.spy();
    const queries = [
      {
        type: 'a',
        payload: {
          hello: 'world'
        }
      },
      {
        type: 'b'
      },
      {
        type: 'c',
        payload: {
          name: 'John Doe'
        }
      }
    ];
    const batchQuery = {
      queryTypes: ['a', 'c'],
      type: 'batch',
      name: 'x',
      request(queries, options) {
        return {
          url: '/api/v1/batch',
          method: 'post',
          payload: {
            data: {
              a: queries[0].payload,
              c: queries[1].payload
            }
          }
        };
      },
      resolve: resolveSpy
    };

    const expectedQueries = [
      {
        type: 'batch',
        url: '/api/v1/batch',
        method: 'post',
        payload: {
          data: {
            a: {
              hello: 'world'
            },
            c: {
              name: 'John Doe'
            }
          }
        },
        resolve: resolveSpy
      },
      {
        type: 'b'
      }
    ];

    filterBatchQuery(
      queries,
      batchQuery
    ).should.deep.equal(expectedQueries);
  });

  it('should ignore incomplete batch query types', () => {
    const queries = [
      {
        type: 'a',
        payload: {
          hello: 'world'
        }
      }
    ];
    const batchQuery = {
      queryTypes: ['a', 'b'],
      name: 'x'
    };
    const expectedQueries = [
      {
        type: 'a',
        payload: {
          hello: 'world'
        }
      }
    ];

    filterBatchQuery(
      queries,
      batchQuery
    ).should.deep.equal(expectedQueries);
  });
});
