# azure-table

Simplified azure table service client for node and the browser.

## Usage

(azure_table can be used with component or requirejs but I am going
to show the global exposed version).

Include [azure_table.js](build/azure_table.js) somewhere then:


```js
// azure still needs some signed query parameters, etc.. to make
// requests see test/server.js for an example server implementation.
var client = new AzureTable({
  signUrl: '/sign'
});

// fetch the top 10 records in the table
client.buildQuery({ '$top': 10 }).then(function(records) {
});

// build query simply passes the query parameters for now.
client.buildQuery({
  '$filter': "(PartitionKey eq 'xfoo')"
});
```

## Notes

CORS must be enabled for your account... From node there is no easy
  way to do this currently so I hacked together [azure-cors](https://github.com/lightsofapollo/azure-cors) which is terrible (but only needs to be run once) way to enable CORS for all methods and domains, etc...
