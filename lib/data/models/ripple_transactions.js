var db          = require('../sequelize');
var validator   = require(__dirname+'/../../validator');
const Sequelize = require('sequelize');
const crypto    = require('crypto');
const _         = require('lodash');

var RippleTransactions = db.define('ripple_transactions', {
  id: { 
    type: Sequelize.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  to_address_id: { 
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      notNull: true,
      isInt: true
    }
  },
  from_address_id: { 
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      notNull: true,
      isInt: true
    }
  },
  to_amount: { 
    type: Sequelize.DECIMAL,
    allowNull: true,
    validate: {
      notNull: false,
      isDecimal: true
    }
  },
  to_currency: { 
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      notNull: false,
      isAlphanumeric: true
    }
  },
  to_issuer: { 
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      isRippleAddress: function(value) {
        if (!validator.isRippleAddress(value)) {
          throw new Error('Must be a valid ripple address');
        }
      }
    }
  },
  from_amount: { 
    type: Sequelize.DECIMAL,
    allowNull: true,
    validate: {
      notNull: false,
      isDecimal: true
    }
  },
  from_currency: { 
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      notNull: false,
      isAlphanumeric: true
    }
  },
  from_issuer: { 
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      isRippleAddress: function(value) {
        if (!validator.isRippleAddress(value)) {
          throw new Error('Must be a valid ripple address');
        }
      }
    }
  },
  transaction_state:{ 
    type: Sequelize.STRING,
    allowNull: true
  },
  transaction_hash: { 
    type: Sequelize.STRING,
    allowNull: true
  },
  uid: {
    type: Sequelize.STRING,
    unique: true
  },
  data: {
    type: Sequelize.STRING,
    allowNull: true
  },
  state: {
    type: Sequelize.STRING,
    allowNull: true
  },
  external_transaction_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    validate: {
      isInt: true
    }
  },
  invoice_id: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      isValidHash: function(value) {
        if (!validator.isValidHash(value)) {
          throw new Error('Must be a valid SHA-256 hash');
        }
      }
    }
  },
  memos: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  direction: {
    type: Sequelize.STRING,
    validate: {
      isIn: [['to-ripple', 'from-ripple']]
    }
  }
}, {
  getterMethods: {
    data: function () {
      try {
        return JSON.parse(this.getDataValue('data'));
      } catch(e) {
        return this.getDataValue('data');
      }
    },
    memos: function () {
      try {
        return JSON.parse(this.getDataValue('memos'));
      } catch(e) {
        return this.getDataValue('memos');
      }
    },
    to_amount: function () {
      try {
        return parseFloat(this.getDataValue('to_amount'));
      } catch(e) {
        return this.getDataValue('to_amount');
      }
    },
    from_amount: function () {
      try {
        return parseFloat(this.getDataValue('from_amount'));
      } catch(e) {
        return this.getDataValue('from_amount');
      }
    }
  },
  setterMethods: {
    to_issuer: function(value) {
      var toIssuer = _.isEmpty(value) ? undefined : value;
      this.setDataValue('to_issuer', toIssuer);
    },
    from_issuer: function(value) {
      var fromIssuer = _.isEmpty(value) ? undefined : value;
      this.setDataValue('from_issuer', fromIssuer);
    },
    data: function (value) {
      this.setDataValue('data', JSON.stringify(value));
    },
    invoice_id: function (value) {
      var hash            = crypto.randomBytes(32).toString('hex');
      var invoiceIdValue  = _.isEmpty(value) ? hash : value;

      this.setDataValue('invoice_id', invoiceIdValue.toUpperCase());
    },
    memos: function (value) {
      this.setDataValue('memos', JSON.stringify(value));
    }
  }
});

RippleTransactions.initModel = function(forced) {
  return db.sync({force: forced});
};

module.exports = RippleTransactions;
