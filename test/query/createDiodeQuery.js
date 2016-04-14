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
    }, {
      a: 'b',
      1: 2
    });

    const expectedStructure = {
      SimpleSentences: {
        login: null
      }
    };
    const expectedParams = {
      a: 'b',
      1: 2
    };

    query.fragmentStructure.should.be.deep.equal(expectedStructure);
    query.params.should.be.deep.equal(expectedParams);
    query.type.should.be.equal(QueryShape.type);
  });

  it('should throw error if query shape doesn\'t have a type', () => {
    const QueryWithNoType = {
      request() {},
      resolve() {}
    };
    function shouldThrow() {
      return createDiodeQuery(QueryWithNoType, {});
    }
    shouldThrow.should.throw('Expected query definition to have query type');
  });

  it('should throw error if query shape doesn\'t have request method', () => {
    const QueryWithNoRequest = {
      type: 'QueryWithNoRequest',
      resolve() {}
    };
    function shouldThrow() {
      return createDiodeQuery(QueryWithNoRequest, {});
    }
    shouldThrow.should.throw(
      'Expected query definition to have .request() method'
    );
  });

  it('should throw error if query shape doesn\'t have resolve method', () => {
    const QueryWithNoResolve = {
      type: 'QueryWithNoResolve',
      request() {}
    };
    function shouldThrow() {
      return createDiodeQuery(QueryWithNoResolve, {});
    }
    shouldThrow.should.throw(
      'Expected query definition to have .resolve() method'
    );
  });
});
