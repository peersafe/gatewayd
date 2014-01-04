var Sequelize = require('sequelize');
var db = require('../../config/initializers/sequelize.js');
var BankAccount = require('../models/account');

var BankTx = sequelize.define('bank_transaction', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  deposit: { type: Sequelize.BOOLEAN, allowNull: false },
  currency: { type: Sequelize.STRING, allowNull: false },
  bankAccountId: { type: Sequelize.INTEGER, allowNull: false },
	balanceId: { type: Sequelize.INTEGER, allowNull: false },
  cashAmount: { type: Sequelize.FLOAT(11,12), allowNull: false },
  rippleTxId: Sequelize.INTEGER
});

module.exports = BankTx;