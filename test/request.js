/**
This is an abstracted preconfigured version of request
based on the current runtime (either node or browser)
*/
var Request = require('../request');

module.exports = function() {
  var config;
  if (typeof window !== 'undefined') {
    config = require('./config/browser')();
  }

  if (!config) {
    config = require('./config/node')();
  }

  return new Request(config.table, config.adapter);
};
