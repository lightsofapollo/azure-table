var config = require('./defaults');
var superagent = require('superagent-promise');
var adapter = require('../../adapter/shared_signature');

module.exports = function() {

  var req = superagent.post(config.url).end();

  return req.then(function(res) {
    return {
      table: config.table,
      adapter: adapter(res.body)
    }
  });
};
