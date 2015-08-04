var test = require('tape');

test('can be loaded twice', function (t) {
  var config = require('../')('fixtures/one');

  t.equal(config.foo, 1, 'config matches');
  t.equal(config.bar, 2, 'config matches');

  var config2 = require('../')('fixtures/two');
  t.equal(config2.foo, 10, 'config2 matches');
  t.equal(config2.bar, 20, 'config2 matches');

  t.end();
});

test.only('env values override', function (t) {
  process.env.SNYK_foo = 100; // jshint ignore:line
  process.env.PORT = 8888; // jshint ignore:line
  var config = require('../')('fixtures/one');

  console.log(config);

  t.equal(config.foo, 100, 'config matches');
  t.equal(config.bar, 2, 'config matches');

  t.end();
});

test('can be called without a path', function (t) {
  t.ok(require('../')(), 'config loaded without a path');
  t.end();
});