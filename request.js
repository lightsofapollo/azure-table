/**
@module azure-table/request
*/

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

/**
The reques module handles creation of http request for azure resources. The Goal
is to provide a minimal level of abstraction on top of http so high level abstractions
can be built without compromising low level capabilities.


@alias module:azure-table/request
@constructor
@param {String} tableName for this request object.
@param {Object} adapter (one of azure-table/adapter/* or your own)
@example

  var table = new Request('myTable', require('azure-table/adapter/fetch_signature')('/url'));

  var req = table.insertEntity({
    PartitionKey: 'xfoo',
    RowKey: 'bar'
  });

  req.set('Prefer', 'no-return');

  // XXX: note we wrap superagent with superagent-promise so promises are
  // returned on .end.
  req.end().then(function(res) {
    // ...
  });

*/
function Request(tableName, adapter) {
  this.table = tableName;
  this.adapter = adapter;

  this.headers = {
    // ensure we are always using the right version of azure
    'x-ms-version': '2013-08-15',

    // default to minimalistic json
    'Accept':       'application/json'
  };
}

Request.prototype = {
  headers: null,

  /**
  Build a superagent request from url and method and apply the adapter
  and any common headers to the request.

  @param {String} url for the request (not including host!)
  @param {String} method for the request.
  @return {Superagent}
  */
  request: function(url, method) {
    var req = request(url, method);

    // validator adapter can manip
    this.adapter(req);

    // XXX: This _must_ come after adapter so we can set the host in node.
    req.set(this.headers);

    // Add validator to the promise chain.
    onResponse(req, assertResponseOk);

    return req;
  },

  /**
  Set global headers for all requests (like setting Accept, x-ms-version, etc..)

  @param {Object|String} objectOrKey for setting headers.
  @param {String} [value] header value.
  */
  set: function(key, value) {
    if (typeof key === 'object') {
      var object = key;
      for (field in object) this.set(field, object[field]);
      return;
    }
    this.headers[key] = value;
  },

  /**
  Build an http request for a queryEntities.

  @param {Object} options to limit queryEntities (these are not headers)
  @see http://msdn.microsoft.com/en-us/library/azure/dd179405.aspx
  @return {Superagent}
  */
  queryEntities: function(options) {
    var req = this.request(
      'GET',
      tableUrl(this.table, options || {})
    );

    return req;
  },

  /**
  This method is a shortcut for a common operation of fetching a single entity by it's 
  RowKey & PartitionKey and is a wrapper for the `queryEntities` method.

  @see http://msdn.microsoft.com/en-us/library/azure/dd179421.aspx
  @return {Superagent}
  */
  getEntity: function(entity) {
    return this.queryEntities({
      RowKey: entity.RowKey,
      PartitionKey: entity.PartitionKey
    })
  },

  /**
  Begin an insert (POST) entity operation.

  @see http://msdn.microsoft.com/en-us/library/azure/dd179421.aspx
  @param {Object} entity.
  @return {Superagent}
  */
  insertEntity: function(entity) {
    return this.request('POST', this.table).send(entity);
  },

  /**
  Merge new data into an existing entity.

  @see http://msdn.microsoft.com/en-us/library/azure/dd179392.aspx
  @param {Object} entity.
  @return {Superagent}
  */
  mergeEntity: function(entity) {
    var req = this.request(
      'MERGE',
      tableUrl(this.table, { RowKey: entity.RowKey, PartitionKey: entity.PartitionKey })
    );
    req.send(entity);
    return req;
  },

  /**
  Delete an entity from the table, note that you _must_ set the `If-Match` header.

  @see http://msdn.microsoft.com/en-us/library/azure/dd135727.aspx
  @param {Object} entity.
  @return {Superagent}
  */
  deleteEntity: function(entity) {
    return this.request(
      'DELETE',
      tableUrl(this.table, { RowKey: entity.RowKey, PartitionKey: entity.PartitionKey })
    );
  },

  createTable: function() {
    var req = this.request('POST', 'Tables');
    req.send({ TableName: this.table });

    return req;
  },

  deleteTable: function() {
    return this.request(
      'DELETE',
      'Tables(\'' + this.table + '\')'
    );
  }
};

module.exports = Request;
