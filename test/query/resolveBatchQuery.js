import { describe, it } from 'mocha';
import resolveBatchQuery from '../../src/query/resolveBatchQuery';
import chai from 'chai';

chai.should();

describe('resolveBatchQuery', () => {
  it('should use each query resolve function', () => {
    const batchResponse = {
      typeA: {
        data: {
          text: 'hello world'
        }
      },
      typeB: {
        data: {
          id: 1,
          name: 'test'
        }
      },
      unknownType: {
        status: 'ignored'
      }
    };
    const queries = [
      {
        type: 'typeA',
        resolve(response) {
          return {
            text: response.data.text
          };
        }
      },
      {
        type: 'typeB',
        resolve(response) {
          return response.data;
        }
      }
    ];

    const expectedResponse = {
      typeA: {
        text: 'hello world'
      },
      typeB: {
        id: 1,
        name: 'test'
      }
    };

    resolveBatchQuery(
      batchResponse,
      queries
    ).should.deep.equal(expectedResponse);
  });
});
