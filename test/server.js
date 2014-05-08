var URL = require('url');
var azure = require('azure');
var azureSAS = require('azure-sas');
var tableService = azure.createTableService();
var config = require('./config');
var express = require('express');
var cors = require('cors');

function ensureTable(callback) {
  tableService.createTable(config.table, function() {
    callback && callback.apply(this, arguments);
  });
}

// create the server
var host = URL.parse(config.url);
var app = express();
app.use(cors());

app.post('/auth', function(req, res) {
  var signed = {};
  var query = azureSAS.table({
    resource: config.table.toLowerCase(),
    signedexpiry: new Date(Date.now() + 60 * 1000),
    signedpermissions: 'raud'
  });

  signed.query = query;
  signed.table = config.table;
  signed.host = 'https://' + process.env.AZURE_STORAGE_ACCOUNT + '.';
  signed.host += 'table.core.windows.net';

  // sign the resource and return it
  res.send(200, signed);
});

ensureTable();

app.listen(host.port);
