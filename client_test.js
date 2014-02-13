suite('client', function() {
  require('./vendor/mocha-as-promised')();

  var Client = require('./client');

  var request = require('./vendor/superagent');
  var config = require('./test/config');
  var assert = require('./test/chai');

  var subject;
  setup(function() {
    subject = new Client({
      signUrl: config.url
    });
  });

  suite('#buildQuery', function() {
    var entity = {
      PartitionKey: 'xfoo',
      RowKey: String(Date.now()),
      name: 'woot'
    };

    setup(function() {
      return subject.insertEntity(entity);
    });

    test('query for specific field', function() {
      var filter = "(PartitionKey eq '" + entity.PartitionKey + "') and " +
                   "(RowKey eq '" + entity.RowKey + "')";

      var query = subject.buildQuery({
        '$top': 1,
        '$filter': filter
      });

      return query.then(
        function(values) {
          assert.equal(values.length, 1);
          assert.equal(values[0].RowKey, entity.RowKey);
        }
      );
    });
  });

  test('#fetchSharedSignature', function() {
    return subject.fetchSharedSignature().then(
      function() {
        assert.ok(subject.host, 'has host');
        assert.ok(subject.query, 'has query');
        assert.equal(subject.table, config.table);
      }
    );
  });
});
