var db =  require('../data/sequelize.js');
var Sequelize = require('sequelize');

var trustline = db.define('Test7trustlines',{
   currency:Sequelize.STRING,
   By:Sequelize.STRING,
   Amount:Sequelize.INTEGER
});

module.exports = trustline;
