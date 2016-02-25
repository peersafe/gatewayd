var db =  require('../sequelize.js');
var Sequelize = require('sequelize');

var asset = db.define('asset',{
   PaymentHash:Sequelize.STRING,
   CurrencyName:Sequelize.STRING,
   CurrencySymbol:Sequelize.STRING,
   CurrencyOwner:Sequelize.STRING,
   CurrencyAmount:Sequelize.INTEGER,
   CurrencyStatus:Sequelize.INTEGER
});

module.exports = asset;
