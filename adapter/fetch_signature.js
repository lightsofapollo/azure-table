var superagent = require('superagent-promise');

function signRequestWithSAS(request, sas) {
  request.url = sas.host + '/' + request.url;
  request.query(sas.query);
}

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
