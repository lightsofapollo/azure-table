suite('signing server', function() {
  var assert = require('assert');
  var request = require('superagent');
  var config = require('./config');

  setup(function(done) {
    var server = require('./server')();
    server.once('listening', done);
  });

  test('get signed query params from azure', function(done) {
    request.post(config.url).
      end(function(err, result) {
        assert.equal(result.res.statusCode, 200);
        done();
      });
  });
});
