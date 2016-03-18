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
    const customNetworkLayer = { sendQueries: sinon.spy() };
    const queries = [{}, {}];
    const options = {};

    network.injectNetworkLayer(customNetworkLayer);
    network.sendQueries(queries, options);
    customNetworkLayer.sendQueries.should.be.calledWith(queries, options);
  });
});
