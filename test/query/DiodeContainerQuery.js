import DiodeContainerQuery from '../../src/query/DiodeContainerQuery';
import { describe, it } from 'mocha';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.should();
chai.use(sinonChai);

describe('DiodeContainerQuery', () => {
  it('should create map from queries', () => {
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

    const expectedQueryMap = {
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
    query.map.should.be.deep.equal(expectedQueryMap);
  });

  it('should group distinct query type', () => {
    const queries = {
      content: {
        type: 'contentResource',
        fragmentStructure: {
          SimpleSentences: {
            login: null
          }
        }
      },
      cr: {
        type: 'contentResource',
        fragmentStructure: {
          SimpleSentences: {
            logout: null
          }
        }
      }
    };

    const expectedQueryMap = {
      content: {
        type: 'contentResource',
        fragmentStructure: {
          SimpleSentences: {
            login: null,
            logout: null
          }
        }
      },
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
    query.map.should.be.deep.equal(expectedQueryMap);
  });

  it('should merge map from queries and children', () => {
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
    const children = [
      {
        query: new DiodeContainerQuery({
          cr: {
            type: 'contentResource',
            fragmentStructure: {
              SimpleSentences: {
                night: null
              }
            }
          }
        })
      },
      {
        query: new DiodeContainerQuery({
          hotel: {
            type: 'hotelDetail',
            fragmentStructure: {
              id: '$hotelDetailId'
            }
          }
        })
      }
    ];

    const expectedQueryMap = {
      cr: {
        type: 'contentResource',
        fragmentStructure: {
          SimpleSentences: {
            login: null,
            logout: null,
            night: null
          }
        }
      },
      hotel: {
        type: 'hotelDetail',
        fragmentStructure: {
          id: '$hotelDetailId'
        }
      }
    };

    const query = new DiodeContainerQuery(queries, children);
    query.map.should.be.deep.equal(expectedQueryMap);
  });

  it('should merge child queries even though they have different keys', () => {
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
    const children = [
      {
        query: new DiodeContainerQuery({
          content: {
            type: 'contentResource',
            fragmentStructure: {
              SimpleSentences: {
                night: null
              }
            }
          }
        })
      }
    ];

    const expectedQueryMap = {
      cr: {
        type: 'contentResource',
        fragmentStructure: {
          SimpleSentences: {
            login: null,
            logout: null,
            night: null
          }
        }
      },
      content: {
        type: 'contentResource',
        fragmentStructure: {
          SimpleSentences: {
            login: null,
            logout: null,
            night: null
          }
        }
      }
    };

    const query = new DiodeContainerQuery(queries, children);
    query.map.should.be.deep.equal(expectedQueryMap);
  });

  it('should warn if found same key with different query type', () => {
    const warnStub = sinon.stub(console, 'warn');
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
    const children = [
      {
        query: new DiodeContainerQuery({
          cr: {
            type: 'hotelDetail',
            fragmentStructure: {
              hotel: {
                id: 1234
              }
            }
          }
        })
      }
    ];

    /* eslint no-unused-vars: 0 */
    const query = new DiodeContainerQuery(queries, children);
    warnStub.should.be.calledWithExactly(
      'Found same query key (%s) with different type (%s and %s)',
      'cr',
      'contentResource',
      'hotelDetail'
    );
    warnStub.restore();
  });
});
