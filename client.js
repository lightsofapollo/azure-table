var superagent = require('superagent-promise');

/**
Wrap a method to ensure we have a signature before sending it.
*/
function ensureSignature(method) {
  return function() {
    var args = Array.prototype.slice.call(arguments);

    if (this.host && this.query) {
      return method.apply(this, args);
    }

    this._pendingSignature =
      this._pendingSignature || this.fetchSharedSignature();

    return this._pendingSignature.then(function() {
      return method.apply(this, args);
    }.bind(this));
  };
}

/**
Create the superagent request and add the constant values.

@param {String} method to use.
@param {String} path for superagent.
@return {Request}
*/
function request(method, path) {
  var req = superagent(method, path);
  req.set('Accept', 'application/json;odata=nometadata');
  return req;
}

function validateStatus(promise) {
  return promise.then(function(res) {
    if (!res.ok) {
      var body = res.body;
      var error = body['odata.error'];

      var err = new Error(
        'Reponse is not ok - ' + res.status + '\n' +
        error.code
      );

      err.reponse = res;
      throw err;
    }
    return res.body;
  });
}

/**
Configure the table client

@param {Object} options for client.
@param {String} options.signUrl where to fetch credentials from.
*/
function Client(options) {
  this.signUrl = options.signUrl;
}

Client.prototype = {
  /**
  @type {String} host for the client requests.
  */
  host: '',

  /**
  Query parameters to use for all requests.

  @type{Object}
  */
  query: null,

  _request: function(method, path) {
    var url = this.host + '/' + path;
    return request(method, url).
              set('x-ms-version', '2013-08-15').
              query(this.query);
  },

  /**
  Insert an entity into the azure table.
  @param {Object} object to insert into azure.
  @return {Promise}
  */
  insertEntity: ensureSignature(function(object) {
    var req = this._request('POST', this.table);
    req.send(object);
    return validateStatus(req.end());
  }),

  /**
  Building block for queries (does not return a promise)

  @param {Object} query parameters to pass directly to azure.
  @return {Request}
  */
  buildQuery: ensureSignature(function(query) {
    var url = this.table + '()';
    var req = this._request('GET', url);
    req.query(query);
    return validateStatus(req.end()).then(function(result) {
      return result.value;
    });
  }),

  /**
  Update the shared signature details so we can talk to azure.

  @param {String} host to issue requests to.
  @param {Object} query signed credentials.
  */
  setSharedSignature: function(table, host, query) {
    this.table = table;
    this.host = host;
    this.query = query;
  },

  /**
  Get the shared signature from the sign url.
  */
  fetchSharedSignature: function() {
    // fetch the new signature
    return request('POST', this.signUrl).end().then(
      function gotSigned(value) {
        var body = value.body;
        this.setSharedSignature(
          body.table,
          body.host,
          body.query
        );

      }.bind(this)
    );
  },

};

module.exports = Client;
