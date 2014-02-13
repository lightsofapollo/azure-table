var URL = require('url');
var azure = require('azure');
var azureSAS = require('azure-sas');
var tableService = azure.createTableService();
var config = require('./config');
var express = require('express');

function ensureTable(callback) {
  tableService.createTable(config.table, callback);
}

function factory(callback) {
  // create the server
  var host = URL.parse(config.url);
  var app = express();

  app.post('/auth', function(req, res) {
    // sign the resource and return it
    res.send(200, azureSAS.table({
      resource: config.table.toLowerCase(),
      signedexpiry: new Date(Date.now() + 60 * 1000)
    }));
  });

  // ensure the table is created before exposing our test server.
  ensureTable(function() {
    var server = app.listen(host.port);

    if (typeof callback === 'function')
      callback(null, server);
  });

  return app;
}

module.exports = factory;
