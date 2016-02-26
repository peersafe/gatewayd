var db =  require('../sequelize.js');
var Sequelize = require('sequelize');

var assets = db.define('asset',{
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code:Sequelize.STRING,
  name:Sequelize.STRING,
  symbol:Sequelize.STRING,
  owner:Sequelize.STRING,
  amount:Sequelize.INTEGER,
  status:Sequelize.INTEGER, 
  hash:Sequelize.STRING
});

module.exports = assets;
