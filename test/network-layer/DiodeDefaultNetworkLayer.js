import { describe, it } from 'mocha';
import chai from 'chai';
import nock from 'nock';
import DefaultNetworkLayer from '../../src/network-layer/DiodeDefaultNetworkLayer';

chai.should();

describe('DiodeDefaultNetworkLayer', () => {
  it('should store base API endpoint and have default headers', () => {
    const network = new DefaultNetworkLayer('http://localhost:3000');
    const expectedDefaultHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    network._baseApiEndpoint.should.be.equal('http://localhost:3000');
    network._defaultHeaders.should.be.deep.equal(expectedDefaultHeaders);
  });

  it('should resolve sendQueries with Map<queryType, queryResponse>', done => {
    const network = new DefaultNetworkLayer('http://localhost:3000');
    const queryMock1 = {
      type: 'contentResource',
      url: '/v1/content',
      method: 'post',
      resolve(response, fragment, options) {
        return response.data;
      },
      payload: {
        SimpleSentences: [
          'login'
        ]
      }
    };
    const queryMock2 = {
      type: 'hotelDetail',
      url: '/v2/hotel/detail/1234',
      method: 'get',
      resolve(response, fragment, options) {
        return response.data;
      }
    };

    const query1ResponseMock = {
      data: {
        SimpleSentences: {
          login: 'Masuk'
        }
      }
    };

    const query2ResponseMock = {
      data: {
        id: 1234,
        name: 'Noname Hotel'
      }
    };

    // mock query 1 api call
    nock('http://localhost:3000')
    .post('/v1/content')
    .reply(200, query1ResponseMock);

    // mock query 2 api call
    nock('http://localhost:3000')
    .get('/v2/hotel/detail/1234')
    .reply(200, query2ResponseMock);

    network.sendQueries([queryMock1, queryMock2], {}).then(response => {
      const expectedResponse = [
        {
          data: {
            SimpleSentences: {
              login: 'Masuk'
            }
          }
        },
        {
          data: {
            id: 1234,
            name: 'Noname Hotel'
          }
        }
      ];
      response.should.be.deep.equal(expectedResponse);
      done();
    });
  });
});
