var db =  require('../sequelize.js');
var Sequelize = require('sequelize');

var assets = db.define('assets',{
   PaymentHash:Sequelize.STRING,
   CurrencyName:Sequelize.STRING,
   CurrencySymbol:Sequelize.STRING,
   CurrencyOwner:Sequelize.STRING,
   CurrencyAmount:Sequelize.INTEGER,
   CurrencyStatus:Sequelize.INTEGER
});

module.exports = assets;
