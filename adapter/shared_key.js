/**
@fileoverview

The shared key adapter is designed for server side usage where the azure credentials
can be known and used to sign the urls directly.
*/

var azureSign = require('azure-sign/table');
var url = require('url');

function azureHost() {
  return 'https://' + process.env.AZURE_STORAGE_ACCOUNT + '.table.core.windows.net/';
}

function signRequest(request) {
  // we _must_ have a content-type to ensure one is set
  if (!request.get('Content-Type')) {
    request.set('Content-Type', 'application/json');
  }

  // we _must_ have a date header
  if (!request.get('Date')) {
    request.set('Date', new Date().toUTCString());
  }

  // x-ms-version _must_ be set but is setup by the request
  var headers = ['Content-MD5', 'Content-Type', 'Date'].reduce(function(map, header) {
    map[header] = request.get(header);
    return map;
  }, {});

  var auth = azureSign.sharedKey({
    method: request.method,
    headers: headers,
    // path part of the url minus the leading slash!
    resource: url.parse(request.url).path.slice(1)
  });

  request.set('Authorization', auth);
}

// XXX: Should we allow options or just expect everyone to use the standard
//      azure environment variables?
function adapter() {
  return function(subject) {
    // fill in the host
    subject.url = azureHost() + subject.url;

    var end = subject.end;
    subject.end = function() {
      signRequest(subject);
      return end.apply(subject, arguments);
    };
  };

}

module.exports = adapter;
