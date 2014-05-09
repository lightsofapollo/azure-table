suite('request', function() {
  var assert = require('chai').assert;
  var adapter = require('./adapter/fetch_signature');
  var getRequest = require('./test/request');

  var subject;
  setup(function() {
    subject = getRequest();
    subject.set({
      'Accept': 'application/json;odata=nometadata'
    });
  });

  var entity;
  setup(function() {
    var rand = Math.floor(Math.random() * 10000);

    entity = {
      PartitionKey: 'xfoo',
      RowKey: String(rand + '-' + Date.now()),
      Value: 1
    }
  });

  suite('#getEntity / #insertEntity', function() {
    setup(function() {
      return subject.
        insertEntity(entity).
        end();
    });

    test('get entity', function() {
      return subject.
        getEntity(entity).
        end().
        then(function(res) {
          if (res.error) throw res.error;
          for (var key in entity) {
            assert.equal(res.body[key], entity[key]);
          }
        });
    });
  });

  suite('#mergeEntity', function() {
    setup(function() {
      return subject.insertEntity(entity).end();
    });

    var updates;
    setup(function() {
      updates = {
        RowKey: entity.RowKey,
        PartitionKey: entity.PartitionKey,
        Newfield: 'new'
      };

      return subject.mergeEntity(updates).end();
    });

    test('merged results', function() {
      return subject.getEntity(entity).
        end().
        then(function(res) {
          for (var key in updates) {
            assert.propertyVal(res.body, key, updates[key]);
          }

          for (var key in entity) {
            assert.propertyVal(res.body, key, entity[key]);
          }
        });
    });
  });

  suite('#deleteEntity', function() {
    var etag;
    setup(function() {
      return subject.insertEntity(entity).
        end().
        then(function(res) {
          etag = res.header.etag;
        });
    });

    setup(function() {
      return subject.deleteEntity(entity).
        set('If-Match', etag).
        end();
    });

    test('fetching after delete', function() {
      return subject.getEntity(entity).
        end().
        then(function() {
          throw new Error('expected error');
        }).
        catch(function(res) {
          assert.equal(res.status, 404);
        });
    });
  });

  suite('#queryEntities', function() {
    setup(function() {
      return subject.insertEntity(entity);
    });

    test('queryEntities', function() {
      var q = subject.queryEntities();
      var filter = "(PartitionKey eq '" + entity.PartitionKey + "') and " +
                   "(RowKey eq '" + entity.RowKey + "')";

      q.query({
        '$top': 1,
        '$filter': filter
      });

      return q.end().then(function(entity) {
        assert.ok(!entity.body.value.length);
      });
    });
  });

});

