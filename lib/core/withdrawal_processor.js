var gateway = require(__dirname+'/../../');
var async = require('async');

function WithdrawalProcessor(incomingPayment) {
  this.incomingPayment = incomingPayment;
}

WithdrawalProcessor.prototype = {
  
  processIncomingPayment: function(callback) {
    var self = this;
    async.waterfall([
      function(callback) {
        self._getTransactionRippleAddress(callback);
      },
      function(address, callback) {
        self._createWithdrawal(address, callback);
      },
      function(rippleTransaction, callback) {
        self._finalizeRippleTransaction(callback);
      }
    ], callback);
  },

  _getTransactionRippleAddress: function(callback) {
    var self = this;
    var rippleTransaction = self.incomingPayment;
    gateway.data.models.rippleAddresses.find({
      where: { id: rippleTransaction.to_address_id }
    }).complete(function(error, address) {
      if (error){
        callback(error, null);
      } else if (address){
        callback(null, address);
      } else {
        callback('no address found', null);
      }
    });
  },
  
  _createWithdrawal: function(address, callback){
    var self = this;
    var rippleTransaction = self.incomingPayment;
    // var amountMinusFees = rippleTransaction.to_amount * (1 - gateway.config.get('WITHDRAWAL_FEE'));
    gateway.data.models.gatewayTransactions.find({
      where: {
        ripple_transaction_id: rippleTransaction.id
      }
    }).complete(function(error, gatewayTransaction) {
      if (error) {
        logger.error('withdrawal:failed', error);
        callback(error, null);
      } else if (gatewayTransaction) {
        gateway.data.models.externalTransactions.find({
          where: {
            id: gatewayTransaction.external_transaction_id,
            status: 'invoice'
          }
        }).complete(function(error, externalTransaction) {
          if (error) {
            logger.error('withdrawal:failed', error);
            callback(error, null);
          } else if (externalTransaction) {
            externalTransaction.updateAttributes({
              status: 'queued'
            }).complete(function(error, withdrawal) {
              if (error) {
                logger.error('withdrawal:failed', error);
                callback(error, null);
              } else if (withdrawal) {
                self.externalTransactionWithdrawal = withdrawal;
                logger.info('withdrawal:recorded', withdrawal.toJSON());
                callback(null, withdrawal);
              } else {
                logger.error('withdrawal:failed', 'withdrawal not found');
                callback('withdrawal not found', null);
              }
            });
          } else {
            gateway.data.models.externalTransactions.create({
              deposit: false,
              amount: rippleTransaction.to_amount,
              currency: rippleTransaction.to_currency,
              status: 'queued',
              ripple_transaction_id: rippleTransaction.id,
              external_account_id: address.tag
            }).complete(function(error, withdrawal) {
              if (error) {
                logger.error('withdrawal:failed', error);
                callback(error, null);
              } else if (withdrawal) {
                self.externalTransactionWithdrawal = withdrawal;
                logger.info('withdrawal:recorded', withdrawal.toJSON());
                callback(null, withdrawal);
              } else {
                logger.error('withdrawal:failed', 'withdrawal not found');
                callback('withdrawal not found', null);
              }
            });
          }
        });
      } else {
        logger.error('withdrawal:failed', 'gatewayTransaction not found');
        callback('withdrawal not found', null);
      }
    });
  },

  _finalizeRippleTransaction: function(callback){
    var self = this;
    self.incomingPayment.updateAttributes({
      state: 'succeeded'
    }).complete(function(error, rippleTransaction) {
      if (error) {
        logger.info('payments:incoming:finalize:error', error);
        callback(error, null);
      } else {
        logger.info('payments:incoming:finalize:success', rippleTransaction.toJSON());
        callback(null, rippleTransaction);
      }
    });
  }

};

module.exports = WithdrawalProcessor;

