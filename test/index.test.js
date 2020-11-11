const { loadConfig } = require('../');
const path = require('path');
const test = require('tape');

test('can be loaded twice', function(t) {
  var config = loadConfig(__dirname + '/fixtures/one');
  t.equal(config.foo, 1, 'config matches');
  t.equal(config.bar, 2, 'config matches');

  var config2 = loadConfig(__dirname + '/fixtures/two');
  t.equal(config2.foo, 10, 'config2 matches');
  t.equal(config2.bar, 20, 'config2 matches');

  t.end();
});

test('env values override', function(t) {
  process.env.SNYK_foo = 100; // jshint ignore:line
  process.env.SNYK_bar__foo = 200; // jshint ignore:line
  process.env.SNYK_complex__colour = 'red'; // jshint ignore:line
  process.env.SNYK_complex__fruit = 'apple'; // jshint ignore:line
  process.env.SNYK_complex__nested__colour = 'purple'; // jshint ignore:line
  process.env.SNYK_complex__nested__nested__fruit = 'banana'; // jshint ignore:line
  process.env.PORT = 8888; // jshint ignore:line
  var config = loadConfig(__dirname + '/fixtures/one');

  t.equal(config.foo, '100', 'config matches');
  t.deepEqual(config.bar, { foo: '200' }, 'object matches');
  t.deepEqual(
    config.complex,
    {
      animal: 'dog',
      colour: 'red',
      fruit: 'apple',
      nested: {
        animal: 'cat',
        colour: 'purple',
        nested: {
          fruit: 'banana',
        },
      },
    },
    'complex object can be merged into',
  );

  delete process.env.SNYK_foo;
  delete process.env.SNYK_bar__foo;
  delete process.env.SNYK_complex__colour;
  delete process.env.SNYK_complex__fruit;
  delete process.env.SNYK_complex__nested__colour;
  delete process.env.SNYK_complex__nested__nested__fruit;
  delete process.env.PORT;

  t.end();
});

test('secret config overrides local and default', function(t) {
  var config = loadConfig(__dirname + '/fixtures/three', {
    secretConfig: __dirname + '/fixtures/three/config.secret.json',
  });

  t.equal(config.foo, 111, 'default value matches');
  t.equal(config.bar, 42, 'secret value matches');
  t.deepEqual(
    config.baz,
    { key1: 'value1', key2: 'value2' },
    'nesting merge ok',
  );

  t.end();
});

test('can be called without a path', function(t) {
  var config = loadConfig(__dirname);
  t.ok(config, 'config loaded without a path');
  t.end();
});

test('env truthy correctly parsed', function(t) {
  process.env.SNYK_foo = 'TRUE'; // jshint ignore:line
  process.env.SNYK_bar = 'FALSE'; // jshint ignore:line
  process.env.SNYK_baz = true; // jshint ignore:line
  process.env.SNYK_zoo = false; // jshint ignore:line

  var config = loadConfig(__dirname + '/fixtures/one');

  t.strictEqual(config.foo, true, 'TRUE becomes boolean true');
  t.strictEqual(config.bar, false, 'FALSE becomes boolean false');
  t.strictEqual(config.baz, true, 'true becomes boolean true');
  t.strictEqual(config.zoo, false, 'false becomes boolean false');

  delete process.env.SNYK_foo;
  delete process.env.SNYK_bar;
  delete process.env.SNYK_baz;
  delete process.env.SNYK_zoo;

  t.end();
});

// Argv parsing is now disabled
// test('arg truthy correctly parsed', function(t) {
//   var config = loadConfig(__dirname + '/fixtures/one');

//   t.equal(config.afoo, true, 'truth config matches');
//   t.ok(!config.abar, 'false config matches');
//   t.equal(config.azoo, 'true', 'strings left as is');

//   t.end();
// });

test('multiple args with same key gets moved to array', function(t) {
  resetArgv();
  process.argv.push('--afoo=first-value');
  process.argv.push('--afoo=second-value');

  let config = loadConfig(__dirname + '/fixture/one');
  t.deepEqual(
    config.afoo,
    ['first-value', 'second-value'],
    'returns array with multiple values',
  );

  resetArgv();
  process.argv.push('--afoo');
  process.argv.push('first-value');
  process.argv.push('--afoo');
  process.argv.push('second-value');

  config = loadConfig(__dirname + '/fixture/one');
  t.deepEqual(
    config.afoo,
    ['first-value', 'second-value'],
    'returns array with multiple values',
  );

  t.end();
});

test('snyk specific args with SNYK_ prefix', function(t) {
  resetArgv();
  process.argv.push('--snyk_foo');
  process.argv.push('--SNYK_bar');
  process.argv.push('--SNYK_BAZ');
  process.argv.push('--SNYK_foo__bar');

  const config = loadConfig(__dirname + '/fixture/one');

  // --snyk_foo
  t.equal(
    config.foo,
    undefined,
    'lowercase snyk_ option should not be stripped',
  );
  t.equal(config.snyk_foo, true, 'lowercase arg should get passed literally');

  // --SNYK_bar
  t.equal(
    config.snyk_bar,
    undefined,
    'uppercase SNYK_ option should not be available',
  );
  t.equal(
    config.bar,
    true,
    'lowercase arg should get passed without SNYK_ prefix',
  );

  // --SNYK_BAZ
  t.equal(
    config.SNYK_BAZ,
    undefined,
    'uppercase SNYK_ option should not be available',
  );
  t.equal(
    config.snyk_baz,
    undefined,
    'uppercase SNYK_ option should not be available',
  );
  t.equal(
    config.BAZ,
    true,
    'uppercase arg should get passed without SNYK_ prefix',
  );

  t.equal(
    config.foo__bar,
    true,
    'double__underscore options are not split in argv',
  );

  t.end();
});

test('arg with JSON-like string', function(t) {
  resetArgv();
  process.argv.push('--json');
  process.argv.push(JSON.stringify({ hello: 'world' }));

  let config = loadConfig(__dirname + '/fixture/one');
  t.equal(
    typeof config.json,
    'string',
    'JSON-like key should still be a string',
  );

  t.end();
});

test('args unknown', function(t) {
  resetArgv();

  let config = loadConfig(__dirname + '/fixture/one');
  t.equal(config.asome, undefined, 'not existing arg is undefined');

  t.end();
});

test('args whitespaces in assignment', function(t) {
  resetArgv();
  process.argv.push('--abar=   new-value');

  config = loadConfig(__dirname + '/fixture/one');
  t.equal(config.abar, '   new-value', 'should be string with empty spaces');

  resetArgv();
  process.argv.push('--abar=', '   new-value');

  config = loadConfig(__dirname + '/fixture/one');
  t.equal(config.abar, '', 'should be empty string');
  t.deepEqual(
    config._,
    ['   new-value'],
    '_ should be array with spaced string',
  );

  t.end();
});

test('args numbers assignment', function(t) {
  resetArgv();
  process.argv.push('--abar', '1');
  let config = loadConfig(__dirname + '/fixture/one');
  t.equal(config.abar, 1, 'should be 1 without equal sign');

  resetArgv();
  process.argv.push('--abar=0');
  config = loadConfig(__dirname + '/fixture/one');
  t.equal(config.abar, 0, 'should be 0');

  resetArgv();
  process.argv.push('--abar=1');
  config = loadConfig(__dirname + '/fixture/one');
  t.equal(config.abar, 1, 'should be 1');

  resetArgv();
  process.argv.push('--abar=-1');
  config = loadConfig(__dirname + '/fixture/one');
  t.equal(config.abar, -1, 'should be -1');

  resetArgv();
  process.argv.push('--abar=-1.55');
  config = loadConfig(__dirname + '/fixture/one');
  t.equal(config.abar, -1.55, 'should be -1.55');

  resetArgv();
  process.argv.push('--abar=.66');
  config = loadConfig(__dirname + '/fixture/one');
  t.equal(config.abar, 0.66, 'should be 0.66');

  t.end();
});

test('args boolean assignment', function(t) {
  resetArgv();
  process.argv.push('--no-bar');

  let config = loadConfig(__dirname + '/fixture/one');
  t.equal(config.bar, false, 'arguments with no prefix should be false');

  t.end();
});

test('env var substitution throws on missing env vars', function(t) {
  delete process.env.CONFIG_TEST_VALUE;

  try {
    loadConfig(__dirname + '/fixtures/env');
    t.fail('Should have thrown!');
  } catch (err) {
    t.ok(err, 'Throws on missing env vars');
    t.end();
  }
});

test('env var substitution', function(t) {
  var testFixtureValue = 'a fixture value';
  process.env.CONFIG_TEST_VALUE = testFixtureValue;

  var config = loadConfig(__dirname + '/fixtures/env');
  var sourceData = require('./fixtures/env/config.default.json');

  t.equal(config.regular, sourceData.regular, 'regular key matches');

  var replacedValue = sourceData.nested.toBeReplaced.replace(
    /\${CONFIG_TEST_VALUE}/g,
    testFixtureValue,
  );
  t.equal(
    config.nested.toBeReplaced,
    replacedValue,
    'nested substitution works',
  );

  replacedValue = sourceData.toBeReplaced.replace(
    /\${CONFIG_TEST_VALUE}/g,
    testFixtureValue,
  );
  t.equal(config.toBeReplaced, replacedValue, 'substitution works');

  t.end();
});

test('env overrides for which files to read', (t) => {
  const servEnv = __dirname + '/fixtures/serv-env';
  process.env.SERVICE_ENV = 'foo';
  process.env.CONFIG_SECRET_FILE = path.resolve(
    servEnv,
    'config.super-secret.json',
  );
  const config = loadConfig(servEnv);
  t.equal(config.secret, 42);
  t.equal(config.source, 'from-foo');

  delete process.env.SERVICE_ENV;
  delete process.env.CONFIG_SECRET_FILE;
  t.end();
});

test('type can be changed from int to string', (t) => {
  const config = loadConfig(__dirname + '/fixtures/type-change');

  t.equal(config.foo, 'bar', '10 becomes bar');
  t.end();
});

function resetArgv() {
  process.argv.length = 2;
}
