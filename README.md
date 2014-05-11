# azure-table

Azure table library for node & browsers

## Usage

(azure_table can be used with component or requirejs but I am going
to show the common js version).

```js
var adapter = require('azure-table/adapter/shared_signature')({
  // XXX: see azure-sign package which can generate this for you
  host: 'http://...',
  query: '...'
});

// requests see test/server.js for an example server implementation.
var table = require('azure-table/request')(
  'myTable',
  adapter
)

// this is a superagent request
var request = table.queryEntities();
request.query('$top', 10);

request.end().then(function(res) {
  // res.body
});

```

## Notes

CORS must be enabled for your account... From node there is no easy
  way to do this currently so I hacked together [azure-cors](https://github.com/lightsofapollo/azure-cors) which is terrible (but only needs to be run once) way to enable CORS for all methods and domains, etc...
