var db =  require('../data/sequelize.js');
var Sequelize = require('sequelize');

var trustline = db.define('Testtrustlines',{
   PaymentHash:Sequelize.STRING,
   CurrencyName:Sequelize.STRING,
   CurrencySymbol:Sequelize.STRING,
   CurrencyOwner:Sequelize.STRING,
   CurrencyCreateTime:Sequelize.STRING,
   CurrencyAmount:Sequelize.INTEGER,
   CurrencySend:Sequelize.BOOLEAN
});

module.exports = trustline;
