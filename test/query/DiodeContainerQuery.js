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

    const query = new DiodeContainerQuery('TestComponent', queries);
    query.map.should.be.deep.equal(expectedQueryMap);
  });

  it('should throw error for invalid query type', () => {
    const queries = {
      cr: {
        just: 'random',
        object: 'passed'
      }
    };

    const queryCreation = () => new DiodeContainerQuery('TestComponent', queries);
    queryCreation.should.throw('Invalid query type in query key cr at component TestComponent');
  });

  it('should group distinct query type', () => {
    const queries = {
      content: {
        type: 'contentResource',
        fragmentStructure: {
          SimpleSentences: {
            login: null
          }
        },
        params: {
          a: {
            b: {
              c: 'd'
            }
          }
        }
      },
      cr: {
        type: 'contentResource',
        fragmentStructure: {
          SimpleSentences: {
            logout: null
          }
        },
        params: {
          a: {
            b: 'c'
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
        },
        params: {
          a: {
            b: 'c'
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
        },
        params: {
          a: {
            b: 'c'
          }
        }
      }
    };

    const query = new DiodeContainerQuery('TestComponent', queries);
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
        componentName: 'FirstChildComponent',
        query: new DiodeContainerQuery('FirstChildComponent', {
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
        componentName: 'SecondChildComponent',
        query: new DiodeContainerQuery('SecondChildComponent', {
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

    const query = new DiodeContainerQuery('TestComponent', queries, children);
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
        componentName: 'ChildComponent',
        query: new DiodeContainerQuery('ChildComponent', {
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

    const query = new DiodeContainerQuery('TestComponent', queries, children);
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
        componentName: 'FaultyComponent',
        query: new DiodeContainerQuery('FaultyComponent', {
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
    const query = new DiodeContainerQuery('TestComponent', queries, children);
    warnStub.should.be.calledWithExactly(
      'Different query type for same query key %s: %s (%s) and %s (%s)',
      'cr',
      'TestComponent',
      'contentResource',
      'FaultyComponent',
      'hotelDetail'
    );
    warnStub.restore();
  });

  it('should be able to inject children at runtime', () => {
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
        componentName: 'FirstChildComponent',
        query: new DiodeContainerQuery('FirstChildComponent', {
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
        componentName: 'SecondChildComponent',
        query: new DiodeContainerQuery('SecondChildComponent', {
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

    const query = new DiodeContainerQuery('TestComponent', queries);
    query.injectChildren(children);
    query.map.should.be.deep.equal(expectedQueryMap);
  });
});
