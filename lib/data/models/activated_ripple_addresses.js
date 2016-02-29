var db = require('../sequelize.js');
var Sequelize = require('sequelize');
const config  = require(__dirname+'/../../../config/environment.js');

var ActivatedRippleAddress = db.define('activated_ripple_addresses', {
  id: { 
		type: Sequelize.INTEGER, 
		primaryKey: true,
		autoIncrement: true
	},
  address: { 
    type: Sequelize.STRING,
    validate: { 
      notNull: true
    }
  },
  enabled: { 
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  times: { 
    type: Sequelize.INTEGER,
    defaultValue: 1,
    validate: {
      isInt: true
    }
  },
  total_amount: { 
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: config.get('ACTIVATE_ADDRESS').amount,
    validate: {
      isInt: true
    }
  }
});

module.exports = ActivatedRippleAddress;
