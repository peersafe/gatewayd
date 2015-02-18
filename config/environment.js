/* jshint -W079 */

var nconf = require('nconf');

nconf
  .file({ file: __dirname+'/config.json' })
  .env();

nconf.defaults({
  'ENVIRONMENT': 'production',
  'NODE_ENV': 'development',
  'SSL': true,
  'SSL_KEY_PATH': __dirname+'/../env/certs/server.key',
  'SSL_CERTIFICATE_PATH': __dirname+'/../env/certs/server.crt',
  'HTTP_SERVER': true, // Serve http/json api
  'WEBAPP': true,
  'WEBAPP_PATH': __dirname + '/../node_modules/gatewayd-admin/',
  'PORT': 5000, // Port of http api server
  'HOST': 'localhost',
  'DOMAIN': 'example.com', // Domain of gateway, for ripple.txt and auth
  'HOT_WALLET': { address: false, secret: false }, // Required
  'COLD_WALLET': null, // Required
  'CURRENCIES': null, // Required
  'WITHDRAWAL_FEE': 0.01, // Required - default 1%
  'DEPOSIT_FEE': 0.01, // Required - default 1%
  'LOGGLY': false,
  'RIPPLE_REST_API': 'https://api.ripple.com/'
});

var DBConfigFile = require(__dirname+'/../lib/data/database.json');
var dbConfig = DBConfigFile[nconf.get('NODE_ENV')];

nconf.set('DATABASE_USER', dbConfig.user);
nconf.set('DATABASE_PASSWORD', dbConfig.password);
nconf.set('DATABASE_NAME', dbConfig.database);
nconf.set('DATABASE_HOST', dbConfig.host);
nconf.set('DATABASE_PORT', dbConfig.port);
nconf.set('DATABASE_DIALECT', dbConfig.dialect);
nconf.set('DATABASE_LOGGING', dbConfig.logging);
nconf.set('DATABASE_URL', null);

module.exports = nconf;
