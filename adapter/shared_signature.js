/**
@module azure-table/adapter/shared_signature
*/

/**
@alias module:azure-table/adapter/shared_signature
@param {Object} options for adapter.
@param {Object|String} options.query query string for shared signature.
@param {String} options.host leading host (and protocol) for azure table.
*/
function adapter(options) {
  return function(subject) {
    var args = arguments;
    var end = subject.end;
    subject.end = function() {
      subject.url = options.host + '/' + subject.url;
      subject.query(options.query);
      return end.apply(subject, args);
    };
  };
}

module.exports = adapter;

