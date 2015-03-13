const RippleRestClient = require('ripple-rest-client');
const uuid = require('node-uuid');
const gatewayd = require(__dirname+'/../../');
const hotWallet = gatewayd.config.get('HOT_WALLET');
const util = require('util');
const Promise = require('bluebird');
const rippleRestResponseHandler = require(__dirname+'/../ripple_rest_error_handler.js');
var RippleAddresses = gatewayd.data.models.rippleAddresses;
var utils           = require(__dirname+'/utils');

function OutgoingPayment(outgoingPaymentRecord) {
  this.record = outgoingPaymentRecord;
  this.rippleRestClient = new RippleRestClient({
    api: gatewayd.config.get('RIPPLE_REST_API'),
    account: hotWallet.address,
    secret: hotWallet.secret
  });
}

OutgoingPayment.prototype = {

  processOutgoingPayment: function(callback) {
    var _this = this;

    _this._getRippleAddressRecord()
      .then(function(address){
        return _this._buildPayment(address);
      })

      .then(function(payment){
        return _this._sendPayment(payment);
      })
      .then(function(pendingPayment){
        return _this._confirmPayment(pendingPayment);
      })
      .then(function(paymentResponse){
        return _this._recordAcceptanceOrRejectionStatus(paymentResponse);
      })
      .then(function(){
        gatewayd.logger.info('payment:outgoing:succeeded', _this.record.toJSON());
        callback(null);
      })
      .catch(function(error){
        _this._rippleRestResponseHandler(error).then(function(){
          callback(error);
        });
      });
  },

  _recordAcceptanceOrRejectionStatus: function(payment) {
    var _this = this;

    _this.record.transaction_state = payment.result;
    _this.record.transaction_hash = payment.hash;

    switch(_this.record.transaction_state) {
      case 'tesSUCCESS':
        _this.record.state = 'succeeded';
        break;
      default:
        _this.record.state = 'failed';
    }

    var sourceChange = utils.parseSourceBalanceChanges(payment.source_balance_changes);
    _this.record.from_amount = sourceChange.value;
    _this.record.from_currency = sourceChange.currency;

    var destinationChange = utils.parseDestinationBalanceChanges(payment.destination_balance_changes);
    _this.record.to_amount = destinationChange.value;
    _this.record.to_currency = destinationChange.currency;

    return new Promise(function(resolve, reject) {
      _this.record.save().complete(function(error, record){
        if (error) {
          gatewayd.logger.error('payments:outgoing:buildpayment:', error);
          reject(error);
        } else {
          resolve(record);
        }
      });
    });
  },

  _rippleRestResponseHandler: function(error) {

    var _this = this;
    var normalizedError;

    const failed = 'failed';
    const retry = 'retry';
    const outgoing = 'outgoing';


    return new Promise(function(resolve, reject){

      if (typeof rippleRestResponseHandler[error.error_type] === 'function') {
        normalizedError = rippleRestResponseHandler[error.error_type](error);
      } else if (util.isError(error)) {
        normalizedError = retry;
        gatewayd.logger.error('payments:outgoing:retrying', error);
      }

      switch(normalizedError) {

        case retry:
          _this.record.state = outgoing;
          break;
        case rippleRestResponseHandler.normalized_error_messages.no_paths_found:
          _this.record.transaction_state = rippleRestResponseHandler.rippled_error_codes.no_paths_found;
          _this.record.state = failed;
          break;
        case rippleRestResponseHandler.normalized_error_messages.insufficient_balance:
          _this.record.transaction_state = rippleRestResponseHandler.rippled_error_codes.insufficient_balance;
          _this.record.state = failed;
          break;
        default:
          _this.record.state = failed;
          _this.record.data = error;
          gatewayd.logger.warn('payments:outgoing:failed', _this.record.toJSON());
          gatewayd.logger.error('payments:outgoing:failed', error);
      }

      _this.record.save().complete(function(error, record){
        if (error) {
          gatewayd.logger.error('payments:outgoing:persistrecord:', error);
          reject(error);
        } else {
          resolve({ record: record.toJSON(), handled: normalizedError });
        }

      });
    });
  },

  _getRippleAddressRecord: function() {
    var _this = this;

    return new Promise(function(resolve, reject) {
      RippleAddresses.find(_this.record.to_address_id).then(resolve).error(reject);
    });
  },

  _buildPayment: function(address) {
    var _this = this;
    var paymentObject = {
      amount: _this.record.to_amount,
      currency: _this.record.to_currency,
      from_issuer: _this.record.from_issuer,
      to_issuer: _this.record.to_issuer,
      account: hotWallet.address,
      recipient: address.address
    };

    paymentObject.source_currencies = [];
    paymentObject.source_currencies.push(_this.record.from_currency);

    return new Promise(function(resolve, reject) {
      _this.rippleRestClient.buildPayment(paymentObject, function(error, response) {
        if (error) {
          gatewayd.logger.error('payments:outgoing:buildpayment:', error);
          reject(error);
        } else {
          var payment = response.payments[0];
          if (address.tag) {
            payment.destination_tag = address.tag.toString();
          }

          resolve(payment);
        }
      });
    });

  },
  _sendPayment: function(payment){

    var _this = this;

    if (payment) {

      var paymentObject = {
        payment: payment,
        client_resource_id: uuid.v4(),
        secret: hotWallet.secret
      };

      if (payment.source_tag) {
        paymentObject.payment.source_tag = _this.record.from_address_id.toString();
      }
      if (_this.record.memos) {
        paymentObject.payment.memos = _this.record.memos;
      }
      if (_this.record.invoice_id) {
        paymentObject.payment.invoice_id = _this.record.invoice_id;
      }

      return new Promise(function (resolve, reject) {
        _this.rippleRestClient.sendPayment(paymentObject, function (error, response) {
          if (error) {
            gatewayd.logger.error('payments:outgoing:sendpayment:', error);
            reject(error);
          } else {
            if (response.status_url) {
              resolve(response);
            }
          }
        });
      });
    }
  },
  _confirmPayment: function(pendingPayment) {
    var _this = this;

    return new Promise(function(resolve, reject){

      _this.record.state = 'pending';
      _this.record.save().complete(function(){
        gatewayd.logger.info('payments:outgoing:pending', _this.record.toJSON());
      });

      _this.rippleRestClient.pollPaymentStatus(pendingPayment, function(error, response){
        if (error) {
          gatewayd.logger.error('payments:outgoing:pollpayments:', error);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

};

module.exports = OutgoingPayment;
