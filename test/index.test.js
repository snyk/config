var test = require('tape');

test('can be loaded twice', function (t) {
  var config = require('../')(__dirname + '/fixtures');

  t.equal(config.foo, 1, 'config matches');
  t.equal(config.bar, 2, 'config matches');

  var config2 = require('../');
  t.equal(config2.foo, 1, 'config2 matches');
  t.equal(config2.bar, 2, 'config2 matches');

  t.end();
});