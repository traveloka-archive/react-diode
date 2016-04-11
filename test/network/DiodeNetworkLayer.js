import { describe, it } from 'mocha';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import DiodeNetworkLayer from '../../src/network/DiodeNetworkLayer';

chai.should();
chai.use(sinonChai);

describe('DiodeNetworkLayer', () => {
  it('should be able to supply own network layer', () => {
    const customNetworkLayer = { sendQueries: sinon.spy() };
    const network = new DiodeNetworkLayer();

    network.injectNetworkLayer(customNetworkLayer);
    network._getCurrentNetworkLayer().should.be.deep.equal(customNetworkLayer);
  });

  it('should be able to dispatch sendQuery via supplied network layer', () => {
    const network = new DiodeNetworkLayer();
    const customNetworkLayer = { sendQueries: sinon.stub() };
    const queries = [{}, {}];
    const options = {};

    customNetworkLayer.sendQueries.returns(Promise.resolve({}));
    network.injectNetworkLayer(customNetworkLayer);
    network.sendQueries(queries, options);
    customNetworkLayer.sendQueries.should.be.calledWith(queries, options);
  });

  it('should be able to inject query mock resolver', () => {
    const network = new DiodeNetworkLayer();
    const customNetworkLayer = { sendQueries: sinon.stub() };
    const queries = [
      {
        type: 'shouldBeMocked'
      },
      {
        type: 'shouldNotBeMocked'
      },
      {
        type: 'shouldBeCheckedBeforeMocked'
      }
    ];
    const filteredQueries = [
      {
        type: 'shouldNotBeMocked'
      },
      {
        type: 'shouldBeCheckedBeforeMocked'
      }
    ];
    const options = {};
    const queryMockResolver = {
      shouldBeMocked: sinon.stub(),
      shouldBeCheckedBeforeMocked: sinon.stub()
    };
    customNetworkLayer.sendQueries.returns(Promise.resolve({}));
    queryMockResolver.shouldBeMocked.returns({});
    queryMockResolver.shouldBeCheckedBeforeMocked.returns(null);

    network.injectNetworkLayer(customNetworkLayer);
    network.injectQueryMockResolver(queryMockResolver);
    network.sendQueries(queries, options);
    queryMockResolver.shouldBeMocked.should.be.calledWith(queries[0]);
    customNetworkLayer.sendQueries.should.be.calledWith(
      filteredQueries,
      options
    );
  });
});
