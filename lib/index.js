var nconf = require('nconf');
var path = require('path');

module.exports = function (root) {
  nconf.argv();
  nconf.env({
    separator: '__',
    match: /^SNYK_/,
    whitelist: ['NODE_ENV', 'PORT'],
  });
  nconf.file('local', { file: path.resolve(root, 'config.local.json') });
  nconf.file('default', { file: path.resolve(root, 'config.default.json') });

  module.exports = nconf.get(); // gets only once
  return module.exports;
};