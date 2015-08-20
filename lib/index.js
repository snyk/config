var debug = require('debug')('snyk:config');
var nconf = require('nconf');
var path = require('path');
var pathIsAbsolute = require('path-is-absolute'); // comes with 0.12.x

module.exports = function (dir) {
  if (!dir) {
    dir = '';
  }
  var root = pathIsAbsolute(dir || '') ?
      dir :
      path.resolve(path.dirname(module.parent.filename), dir);

  debug('loading from %s', root);

  var snykMatch = /^SNYK_.*$/;

  nconf.env({
    separator: '__',
    match: snykMatch,
    whitelist: ['NODE_ENV', 'PORT'],
  });
  nconf.argv();
  nconf.file('local', { file: path.resolve(root, 'config.local.json') });
  nconf.file('default', { file: path.resolve(root, 'config.default.json') });

  var config = nconf.get();

  Object.keys(config).forEach(function (key) {
    if (key.match(snykMatch)) {
      config[key.replace(/^SNYK_/, '')] = config[key];
      delete config[key];
    }
  });

  return config;
};