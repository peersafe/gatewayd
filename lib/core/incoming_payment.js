const _                 = require('lodash');
const Promise           = require('bluebird');
const gatewayd          = require(__dirname+'/../../');
var  RippleRestClient   = require('ripple-rest-client');
const rippleRestBaseUrl = gatewayd.config.get('RIPPLE_REST_API');
var utils               = require(__dirname+'/utils');
var db = require('../data/sequelize.js');
var asset = require('../data/models/assets.js');
var exec = require('child_process').exec; 
var querystring =require('querystring');
var Errorfun = require('../../payment-error.js');
var OKfun = require('../../payment-ok.js');


var rippleRestClient  = new RippleRestClient({
  api     : rippleRestBaseUrl,
  account : gatewayd.config.get('COLD_WALLET')
});

function IncomingPayment(paymentNotification) {
  this.payment = {};
  this.paymentNotification  = paymentNotification;
}
//16进制转化为字符串
function hex2a(hexx) {
    var hex = hexx.toString();
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
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
	        //gatewayd.logger.info('----payment:notification:received----:', payment);      
          _this.payment = payment;
          if (_this.paymentNotification.hash) {
            _this.payment.hash = _this.paymentNotification.hash;
          }
  				var array = _this.payment.memos;
					if(array[0].MemoData) //解析附加字节
					{ //忽略外出的交易
						if(_this.payment.direction =="outgoing"){
							console.log("reject outgoing");
						}
						else{
							var str = hex2a(array[0].MemoData);
							var json = JSON.parse(str); 
							gatewayd.logger.info('CurrencyCode:' + json['CurrencyCode']);
							gatewayd.logger.info('CurrencyName:' + json['CurrencyName']);
							gatewayd.logger.info('CurrencySymbol:' + json['CurrencySymbol']);
							gatewayd.logger.info('CurrencyAmount:' + json['CurrencyAmount']);

              //资产创设TRUSTLINE类型
      				if(array[0].parsed_memo_type.toUpperCase() == 'TRUSTLINE')
							{	
										gatewayd.logger.info('CurrencyCode is exist?');
										gatewayd.data.assets.read({CurrencyCode:json['CurrencyCode']},function(err,response){
                    	console.log(err);
									  	if(!err){
											 	gatewayd.logger.info('currency is exist:');
                        
												var param = '{"response":"error","reason":"CurrencyCode exist"}';
											 	Errorfun(param,payment.source_account);
                			}
											else{    //trustline 不存在，则插入记录并返回OK消息并附加HASH值
											 	console.log("currency is not exist ,insert custom currency");
											 	var record = {PaymentHash:payment.hash,CurrencyCode:json['CurrencyCode'],CurrencyName:json['CurrencyName'],CurrencySymbol:json['CurrencySymbol'],
											 	CurrencyOwner:payment.source_account,CurrencyAmount:json['CurrencyAmount'],CurrencyStatus:0};
											 	gatewayd.data.assets.create(
                       	record,function(err,response){console.log(err);});

 												var pos = str.lastIndexOf('}');
												var param = str.substring(0,pos) + ',"hash":'+'"'+payment.hash+'"}';
												console.log(param);
											 	OKfun(param,payment.source_account);
											}
										})
								}
							}	
					}//结束解析附加字节
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
