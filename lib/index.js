var debug = require('debug')('snyk:config');
var nconf = require('nconf');
require('./nconf-truth');
var path = require('path');
var pathIsAbsolute = require('path-is-absolute'); // comes with 0.12.x

module.exports = function (dir, options) {
  if (!dir) {
    dir = '';
  }

  options = options || {};
  var secretConfig = options.secretConfig ||
                     path.resolve(dir, 'config.secret.json');

  if (!pathIsAbsolute(dir)) {
    throw new Error('config requires absolute path to read from');
  }


  var snykMatch = /^SNYK_.*$/;

  nconf.env({
    separator: '__',
    match: snykMatch,
    whitelist: ['NODE_ENV', 'PORT'],
  });
  nconf.argv();
  nconf.file('secret', { file: path.resolve(secretConfig) });
  nconf.file('local', { file: path.resolve(dir, 'config.local.json') });
  nconf.file('default', { file: path.resolve(dir, 'config.default.json') });

  var config = nconf.get();

  Object.keys(config).forEach(function (key) {
    if (key.match(snykMatch)) {
      config[key.replace(/^SNYK_/, '')] = config[key];
      delete config[key];
    }
  });

  debug('loading from %s', dir, JSON.stringify(config, '', 2));

  return config;
};
