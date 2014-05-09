var config = require('./defaults');
var sharedKey = require('../../adapter/shared_key');

module.exports = function() {
  return {
    table: config.table,
    adapter: sharedKey()
  };
};

