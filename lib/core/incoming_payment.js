const _                 = require('lodash');
const Promise           = require('bluebird');
const gatewayd          = require(__dirname+'/../../');
var  RippleRestClient   = require('ripple-rest-client');
const rippleRestBaseUrl = gatewayd.config.get('RIPPLE_REST_API');
var utils               = require(__dirname+'/utils');

var rippleRestClient  = new RippleRestClient({
  api     : rippleRestBaseUrl,
  account : gatewayd.config.get('COLD_WALLET')
});

function IncomingPayment(paymentNotification) {
  this.payment = {};
  this.paymentNotification  = paymentNotification;
}


IncomingPayment.prototype = {
  processPayment: function() {
    var _this = this;
    return new Promise(function(resolve, reject) {
      _this._getPayment()
        .then(function(payment){
           return _this._validatePayment(payment);
        })
        .then(function(payment) {
          return _this._prepareIncomingPayment(payment);
        })
        .then(function(preparedPayment){
          return gatewayd.api.recordIncomingPayment(preparedPayment);
        })
        .then(function(recordedPayment) {
          return _this._updateLastPaymentHash(recordedPayment);
        })
        .then(function(recordedPayment){
          resolve(recordedPayment);
        })
        .catch(function(error) {
          if (error) {
            reject(error);
          }
        });
    });
  },
  _getPayment: function() {
    var _this = this;

    return new Promise (function(resolve, reject) {
      if (_this.paymentNotification && _this.paymentNotification.hash) {
        rippleRestClient.getPayment(_this.paymentNotification.hash, function (error, payment) {
          if (error) {
            return reject(error);
          }
          gatewayd.logger.info('payment:notification:received:', payment);
          _this.payment = payment;
          _this.payment.hash = _this.paymentNotification.hash;
          resolve(payment);
        });
      } else {
        reject(new Error('NoNewPayment'));
      }
    });
  },

  _validatePayment: function(payment) {
    return new Promise(function(resolve, reject) {
      if (payment.destination_account !== gatewayd.config.get('COLD_WALLET')) {
        return reject(new Error('NotColdWallet'));
      }

      if (payment.result !== 'tesSUCCESS') {
        return reject(new Error('NOTtesSUCCESS'));
      }

      if (!payment.destination_balance_changes[0]) {
        return reject(new Error('DestinationBalanceChangesNotFound'));
      }

      if (!payment.source_balance_changes[0]) {
        return reject(new Error('SourceBalanceChangesNotFound'));
      }

      resolve(payment);
    });
  },
  _prepareIncomingPayment: function(payment) {
    var destinationAmount =  utils.parseDestinationBalanceChanges(payment.destination_balance_changes);
    var sourceAmount      =  utils.parseSourceBalanceChanges(payment.source_balance_changes);

    var incomingPayment   = {
      state                : 'incoming',
      source_amount        :  sourceAmount,
      destination_amount   :  destinationAmount,
      destination_tag      :  _.isEmpty(payment.destination_tag) ? undefined : payment.destination_tag,
      transaction_state    :  payment.result,
      hash                 :  payment.hash,
      source_account       :  payment.source_account,
      invoice_id           :  payment.invoice_id,
      memos                :  payment.memos
    };

    return new Promise(function(resolve){
      resolve(incomingPayment);
    });
  },
  _updateLastPaymentHash: function(payment) {
    var newHash = payment.dataValues.transaction_hash;
    return new Promise (function(resolve, reject) {
      gatewayd.api.setLastPaymentHash(newHash).then(function(){
        resolve(payment);
      }).error(reject);
    });
  }
};

module.exports = IncomingPayment;
