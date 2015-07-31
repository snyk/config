var nconf = require('nconf');
var path = require('path');
var pathIsAbsolute = require('path-is-absolute'); // comes with 0.12.x

module.exports = function (dir) {
  var root = pathIsAbsolute(dir) ?
      dir :
      path.resolve(path.dirname(module.parent.filename), dir);

  nconf.argv();
  nconf.env({
    separator: '__',
    match: /^SNYK_/,
    whitelist: ['NODE_ENV', 'PORT'],
  });
  nconf.file('local', { file: path.resolve(root, 'config.local.json') });
  nconf.file('default', { file: path.resolve(root, 'config.default.json') });

  return nconf.get();
};