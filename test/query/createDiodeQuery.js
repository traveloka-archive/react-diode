import { describe, it } from 'mocha';
import { createDiodeQuery } from '../../src/query/createDiodeQuery';
import chai from 'chai';

chai.should();

describe('createDiodeQuery', () => {
  it('should be able to create new query', () => {
    const QueryShape = {
      type: 'contentResource',
      request() {},
      resolve() {}
    };
    const query = createDiodeQuery(QueryShape, {
      SimpleSentences: {
        login: null
      }
    });

    const expectedStructure = {
      SimpleSentences: {
        login: null
      }
    };

    query.fragmentStructure.should.be.deep.equal(expectedStructure);
    query.type.should.be.equal(QueryShape.type);
  });

  // TODO Test throwing error
});
