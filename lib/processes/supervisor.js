var Promise    = require('bluebird');
var pm2        = require('pm2');
pm2.connect    = Promise.promisify(pm2.connect);
pm2.disconnect = Promise.promisify(pm2.disconnect);
pm2.start      = Promise.promisify(pm2.start);
pm2.kill       = Promise.promisify(pm2.killDaemon);

var processSet = require(__dirname+'/index.js');

function parseNameFromPath(path) {
  return 'gatewayd:'+path.split('/').pop().replace('.js', '');
}

function Supervisor() {}

Supervisor.prototype.start = function() {
  return new Promise(function(resolve, reject) {
    var processes;
    return pm2.connect()
      .then(function() {
        return Promise.map(processSet.toArray(), function(path) {
          return pm2.start(path, { name: parseNameFromPath(path) });
        });
      })
      .then(function(started) {
        processes = started;
        return pm2.list();
      })
      .then(function() {
        resolve(processes);
      })
      .error(function(error) {
        pm2.disconnect().then(function() {
          reject(error);
        })
        .error(reject);
      });
  });
};

Supervisor.prototype.stop = function() {
  return pm2.connect()
    .then(function() {
      return pm2.kill();
    }).then(function() {
      return pm2.disconnect(process.exit(0));
    });
};

module.exports = Supervisor;

