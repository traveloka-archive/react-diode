/**
 * @flow
 */
import type { NetworkLayer } from '../tools/DiodeTypes';
import type { DiodeQueryRequest } from '../query/DiodeQueryRequest';

class DiodeNetworkLayer {
  _injectedNetworkLayer: NetworkLayer;

  /**
   * @internal
   *
   * Supply your own network layer
   */
  injectNetworkLayer(
    networkLayer: NetworkLayer
  ): void {
    this._injectedNetworkLayer = networkLayer;
  }

  /**
   * @internal
   *
   * Send diode query via injected network layer
   */
  sendQueries(
    queryRequests: Array<DiodeQueryRequest>,
    options: any
  ): Promise {
    const networkLayer = this._getCurrentNetworkLayer();
    return networkLayer.sendQueries(queryRequests, options);
  }

  _getCurrentNetworkLayer(): NetworkLayer {
    return this._injectedNetworkLayer;
  }
}

module.exports = DiodeNetworkLayer;
