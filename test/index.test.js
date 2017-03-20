// this is hacky, but we can't carry through args from tap, so we do this manually
process.argv.push('--afoo', '--azoo=true');

var test = require('tape');

test('can be loaded twice', function (t) {
  var config = require('../')(__dirname + '/fixtures/one');
  t.equal(config.foo, 1, 'default config matches');
  t.equal(config.bar, 2, 'local config matches');

  t.equal(config.true_value, true, 'default true matches');
  t.equal(config.false_value, false, 'local false matches');
  t.equal(config.zero, 0, 'local zero matches');
  t.equal(config.empty, "", 'local empty matches');

  t.notEqual(config.true_value, 1, 'default true is not 1');
  t.notEqual(config.false_value, 0, 'local false is not 0');
  t.notEqual(config.zero_value, false, 'local zero is not false');
  t.notEqual(config.empty, false, 'local empty is not false');

  var config2 = require('../')(__dirname + '/fixtures/two');
  t.equal(config2.foo, 10, 'config2 matches');
  t.equal(config2.bar, 20, 'config2 matches');
  t.equal(config2.zoo.bla, 123, 'nested config2 matches');
  t.equal(config2.zoo.jar.xyz, "xyz", 'nested config2 matches');

  t.end();
});

test('env values override', function (t) {
  process.env.SNYK_foo = 100; // jshint ignore:line
  process.env.SNYK_bar__foo = 200; // jshint ignore:line
  process.env.PORT = 8888; // jshint ignore:line
  var config = require('../')(__dirname + '/fixtures/one');

  t.equal(config.foo, '100', 'config matches');
  t.deepEqual(config.bar, { foo: '200' }, 'object matches');

  process.env = {};
  t.end();
});

test('env values merge', function (t) {
  process.env.SNYK_foo__baz = "BAZ_ENV"; // jshint ignore:line
  var config = require('../')(__dirname + '/fixtures/three');

  t.deepEqual(config.foo, { bar: 'BAR', baz: 'BAZ_ENV' }, 'object merges');
  console.log(config);

  process.env = {};
  t.end();
});

test('can be called without a path', function (t) {
  t.ok(require('../')(__dirname), 'config loaded without a path');
  t.end();
});

test('env truthy correctly parsed', function (t) {
  process.env.SNYK_foo = 'TRUE'; // jshint ignore:line
  process.env.SNYK_bar = 'FALSE'; // jshint ignore:line
  process.env.SNYK_zoo = 'false'; // jshint ignore:line

  var config = require('../')(__dirname + '/fixtures/one');

  t.equal(config.foo, true, 'truth config matches');
  t.equal(config.bar, false, 'false config matches');
  t.equal(config.zoo, 'false', 'strings left as is');

  process.env = {};

  t.end();
});

test('arg truthy correctly parsed', function (t) {
  var config = require('../')(__dirname + '/fixtures/one');

  t.equal(config.afoo, true, 'truth config matches');
  t.ok(!config.abar, 'false config matches');
  t.equal(config.azoo, 'true', 'strings left as is');

  t.end();
});
