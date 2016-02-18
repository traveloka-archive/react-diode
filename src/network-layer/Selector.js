import DefaultNetworkLayer from './DefaultNetworkLayer';

let activeNetworkLayer = DefaultNetworkLayer;

export function injectNetworkLayer(CustomNetworkLayer) {
  if (typeof CustomNetworkLayer.sendQueries !== 'function') {
    throw new Error('Invalid CustomNetworkLayer without .sendQueries method');
  }

  activeNetworkLayer = CustomNetworkLayer;
}

export function get() {
  return activeNetworkLayer;
}
