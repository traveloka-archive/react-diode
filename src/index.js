/* Diode Public API */
const createContainer = require('./Container');
const Query = require('./query/Query');
const QueryTypes = require('./query/Types');
const fetchData = require('./fetchData');
const { injectNetworkLayer } = require('./network-layer/Selector');

module.exports = {
  QueryTypes,
  createContainer,
  Query,
  fetchData,
  injectNetworkLayer
};
