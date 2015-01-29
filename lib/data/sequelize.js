
var Sequelize = require('sequelize');
var config = require(__dirname+'/../../config/environment.js');

var dbOptions = {
  dialect: config.get('DATABASE_DIALECT'),
  host: config.get('DATABASE_HOST'),
  port: config.get('DATABASE_PORT'),
  logging: config.get('DATABASE_LOGGING'),
  define: {
    timestamps: true,
    updatedAt: '"updatedAt"',
    createdAt: '"createdAt"'
  }
};

var db = new Sequelize(config.get('DATABASE_NAME'), config.get('DATABASE_USER'), config.get('DATABASE_PASSWORD'), dbOptions);

module.exports = db;
