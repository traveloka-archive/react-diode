import { describe, it } from 'mocha';
import chai from 'chai';
import DiodeContainerQuery from '../../src/query/DiodeContainerQuery';
import DiodeRootQuery from '../../src/query/DiodeRootQuery';

chai.should();

describe('DiodeRootQuery', () => {
  it('should give access to container query via public method', () => {
    const queries = {
      cr: {
        type: 'contentResource'
      }
    };
    const containerQuery = new DiodeContainerQuery(queries);
    const rootQuery = new DiodeRootQuery(containerQuery);
    rootQuery.getContainerQuery().should.be.deep.equal(containerQuery);
  });

  it('should replace value map via .setVariables()', () => {
    const queries = {
      cr: {
        type: 'contentResource',
        fragmentStructure: {
          SimpleSentences: {
            login: null,
            logout: null
          }
        }
      }
    };

    const query = new DiodeContainerQuery(queries);
    const rootQuery = new DiodeRootQuery(query);
    rootQuery.setVariables({
      loginStr: 'none',
      logoutStr: 'test'
    });

    const expectedValueMap = {
      loginStr: 'none',
      logoutStr: 'test'
    };

    rootQuery.getVariables().should.be.deep.equal(expectedValueMap);
  });

  it('should replace value map if .setVariables() called multiple times', () => {
    const queries = {
      cr: {
        type: 'contentResource',
        fragmentStructure: {
          SimpleSentences: {
            login: null,
            logout: null
          }
        }
      }
    };

    const query = new DiodeContainerQuery(queries);
    const rootQuery = new DiodeRootQuery(query);
    rootQuery.setVariables({ loginStr: 'none' });
    rootQuery.setVariables({ loginStr: 'test' });
    rootQuery.getVariables().should.be.deep.equal({ loginStr: 'test' });
  });

  it('should compile query map into array of query', () => {
    const queries = {
      cr: {
        type: 'contentResource',
        fragmentStructure: {
          SimpleSentences: {
            login: '$loginStr',
            logout: '$logoutStr'
          },
          HotelDetail: {
            numNight: '1 night',
            extraBed: null
          }
        },
        paramsStructure: {
          parsed: '$isParamsParsed'
        }
      }
    };

    const expectedQueries = [
      {
        type: 'contentResource',
        fragmentStructure: {
          SimpleSentences: {
            login: '$loginStr',
            logout: '$logoutStr'
          },
          HotelDetail: {
            numNight: '1 night',
            extraBed: null
          }
        },
        fragment: {
          SimpleSentences: {
            login: 0,
            logout: '$logoutStr'
          },
          HotelDetail: {
            numNight: '1 night',
            extraBed: null
          }
        },
        paramsStructure: {
          parsed: '$isParamsParsed'
        },
        params: {
          parsed: true
        }
      }
    ];

    const query = new DiodeContainerQuery(queries);
    const rootQuery = new DiodeRootQuery(query);
    rootQuery.setVariables({ loginStr: 0, isParamsParsed: true });
    rootQuery.compile().should.be.deep.equal(expectedQueries);
  });

  it('can use variable in root key of fragment structure', () => {
    const queries = {
      cr: {
        type: 'contentResource',
        fragmentStructure: {
          '$SimpleSentences': {
            login: '$loginStr',
            logout: '$logoutStr'
          }
        },
        paramsStructure: {}
      }
    };

    const expectedQueries = [
      {
        type: 'contentResource',
        fragmentStructure: {
          '$SimpleSentences': {
            login: '$loginStr',
            logout: '$logoutStr'
          }
        },
        fragment: {
          SimpleSentences: {
            login: 0,
            logout: '$logoutStr'
          }
        },
        paramsStructure: {},
        params: {}
      }
    ];

    const query = new DiodeContainerQuery(queries);
    const rootQuery = new DiodeRootQuery(query);
    rootQuery.setVariables({ SimpleSentences: 'SimpleSentences', loginStr: 0, isParamsParsed: true });
    rootQuery.compile().should.be.deep.equal(expectedQueries);
  });
});
