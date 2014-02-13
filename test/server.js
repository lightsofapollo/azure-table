var URL = require('url');
var azure = require('azure');
var azureSAS = require('azure-sas');
var tableService = azure.createTableService();
var config = require('./config');
var express = require('express');

function ensureTable(callback) {
  tableService.createTable(config.table, function() {
  });
}

function factory() {
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

  ensureTable();

  return app.listen(host.port);
}

module.exports = factory;
