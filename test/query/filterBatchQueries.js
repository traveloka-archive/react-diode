import { describe, it } from 'mocha';
import filterBatchQueries from '../../src/query/filterBatchQueries';
import chai from 'chai';
import sinon from 'sinon';

chai.should();

describe('filterBatchQueries', () => {
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
    const batchQueries = [
      {
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
      }
    ];
    const expectedQueries = [
      {
        type: 'b'
      },
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
      }
    ];

    filterBatchQueries(
      queries,
      batchQueries
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
    const batchQueries = [
      {
        queryTypes: ['a', 'b'],
        name: 'x'
      }
    ];
    const expectedQueries = [
      {
        type: 'a',
        payload: {
          hello: 'world'
        }
      }
    ];

    filterBatchQueries(
      queries,
      batchQueries
    ).should.deep.equal(expectedQueries);
  });
});
