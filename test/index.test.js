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