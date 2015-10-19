import DefaultNetworkLayer from './DefaultNetworkLayer';

var activeNetworkLayer = DefaultNetworkLayer;

export default {
  injectNetworkLayer(CustomNetworkLayer) {
    if (typeof CustomNetworkLayer.sendQueries !== 'function') {
      throw new Error('Invalid CustomNetworkLayer without .sendQueries method');
    }

    activeNetworkLayer = CustomNetworkLayer;
  },
  get() {
    return activeNetworkLayer;
  }
};
