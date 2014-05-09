var config = require('./defaults');
var fetchSignature = require('../../adapter/fetch_signature');

module.exports = function() {
  return {
    table: config.table,
    adapter: fetchSignature(config.url)
  };
};
