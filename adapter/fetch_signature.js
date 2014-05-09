/**
@module azure-table/adapter/fetch_signature
*/

var superagent = require('superagent-promise');

function signRequestWithSAS(request, sas) {
  request.url = sas.host + '/' + request.url;
  request.query(sas.query);
}

/**
The fetch signature method is designed for browser usage (though it will work in node)
it expects the server at a particular url to return a signed signature.

For example if your url is set to `/azure/sign` then azure sign would be expected to respond
with a json body like this:
```json
{
  host: 'https://..',
  // table SAS query parameters
  query: { rv: '..' }
}
```
@alias module:azure-table/adapter/fetch_signature
@param {String} url to issue request to.
*/
function adapter(url) {
  // in memory cache for this adapter;
  var sasRequest = null;
  var cache = null;

  function fetchSas() {
    // only issue one sas request per adapter
    if (sasRequest) return sasRequest;
    return sasRequest = superagent.post(url).
      end().
      then(function(res) {
        if (res.error) throw res.error;
        return res.body;
      });
  }

  return function(subject) {
    var end = subject.end;

    subject.end = function() {
      var args = arguments;

      if (cache) {
        signRequestWithSAS(subject, cache);
        return end.apply(subject, args);
      }

      return fetchSas().then(function(sas) {
        cache = sas;
        signRequestWithSAS(subject, sas);
        return end.apply(subject, args);
      });
    };
  };

}

module.exports = adapter;
