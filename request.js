var request = require('superagent-promise');

function tableUrl(table, options) {
  if (!options) return table;

  var params = Object.keys(options).map(function(key) {
    // XXX: should this be url encoded?
    return key + '=\'' + options[key] + '\'';
  });

  return table + '(' + params.join(', ') + ')';
}

function onResponse(request, fn) {
  var end = request.end;

  request.end = function overloadResponse() {
    var promise = end.apply(this, arguments);
    return promise.then(fn);
  };
}

function assertResponseOk(res) {
  if (res.error) {
    throw res.error;
  }
  return res;
}

function Table(tableName, adapter) {
  this.table = tableName;
  this.adapter = adapter;

  this.headers = {
    // ensure we are always using the right version of azure
    'x-ms-version': '2013-08-15'
  };
}

Table.prototype = {
  headers: null,

  _request: function(url, method) {
    var req = request(url, method);

    // validator adapter can manip
    this.adapter(req);

    // XXX: This _must_ come after adapter so we can set the host in node.
    req.set(this.headers);

    // Add validator to the promise chain.
    onResponse(req, assertResponseOk);

    return req;
  },

  set: function(key, value) {
    if (typeof key === 'object') {
      var object = key;
      for (field in object) this.set(field, object[field]);
      return;
    }
    this.headers[key] = value;
  },

  query: function(options) {
    var req = this._request(
      'GET',
      tableUrl(this.table, options || {})
    );

    return req;
  },

  getEntity: function(entity) {
    var req = this._request(
      'GET',
      tableUrl(this.table, { RowKey: entity.RowKey, PartitionKey: entity.PartitionKey })
    );

    return req;
  },

  insertEntity: function(entity) {
    return this._request('POST', this.table).send(entity);
  },

  mergeEntity: function(entity) {
    var req = this._request(
      'MERGE',
      tableUrl(this.table, { RowKey: entity.RowKey, PartitionKey: entity.PartitionKey })
    );
    req.send(entity);
    return req;
  },

  deleteEntity: function(entity) {
    var req = this._request(
      'DELETE',
      tableUrl(this.table, { RowKey: entity.RowKey, PartitionKey: entity.PartitionKey })
    );

    req.header = {};
    return req;
  }
};

module.exports = Table;
