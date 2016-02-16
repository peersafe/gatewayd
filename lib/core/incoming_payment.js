const _                 = require('lodash');
const Promise           = require('bluebird');
const gatewayd          = require(__dirname+'/../../');
var  RippleRestClient   = require('ripple-rest-client');
const rippleRestBaseUrl = gatewayd.config.get('RIPPLE_REST_API');
var utils               = require(__dirname+'/utils');
var db = require('../data/sequelize.js');
var trustline = require('./trustline.js');
var exec = require('child_process').exec; 
var querystring =require('querystring');
 
var rippleRestClient  = new RippleRestClient({
  api     : rippleRestBaseUrl,
  account : gatewayd.config.get('COLD_WALLET')
});

function IncomingPayment(paymentNotification) {
  this.payment = {};
  this.paymentNotification  = paymentNotification;
}

function hex2a(hexx) {
console.log("hex2a");
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
	if(array[0].MemoData)
	{
		if(_this.payment.direction =="outgoing"){
			console.log("reject outgoing");
		}
		else{
			var sourcestr = hex2a(array[0].MemoData);
			console.log("sourcestr:" + sourcestr);

			var json = querystring.parse(sourcestr,'/',':');

               	 	if(json['peersafe'].toLowerCase() == 'trustline')
			{	
				console.log("json str:");
				console.log(json);
                        	console.log("job type:"+json['peersafe']);

				gatewayd.logger.info('json str:'+ json);
				gatewayd.logger.info('job type:'+json['peersafe']);

				//if(!json['response'])
				//{
					console.log("currency:" + json['currency']);
					gatewayd.logger.info('currency:' + json['currency']);
					var query1 = "SELECT EXISTS ( \
    					SELECT 1   \
    					FROM   pg_catalog.pg_class c  \
    					JOIN   pg_catalog.pg_namespace n ON n.oid = c.relnamespace \
    					WHERE  c.relname = 'Test7trustlines'  \
    					AND    c.relkind = 'r'    \
					);"
					db.query(query1).then(function(resp){
		    			if(!resp[0].exists)
	            			{
						console.log("table is not exist,create it and insert currency!");
						gatewayd.logger.info('table is not exist,create it and insert currency!');
  						trustline.sync({force:false}).success(function(){
						console.log("create table success");
						console.log(json['currency']);
						console.log(json['address']);
						console.log(json['amount']);
						trustline.create({currency:json['currency'],By:json['address'],Amount:json['amount']});
						});

						var cmdStr = 'node ./payment-ok.js ';
						exec(cmdStr, function(err,stdout,stderr){
   						if(err) {
        						console.log('******nodejs payment-ok error:*********'+stderr);
gatewayd.logger.info('******nodejs payment-ok error:*********'+stderr);
    						} 
   						else {
							console.log('******nodejs payment-ok success:*********'+stderr);
gatewayd.logger.info('******nodejs payment-ok success:*********'+stderr);
						}});
							
					}
					else{
						console.log("table is exist then query currency is exist?");
gatewayd.logger.info('table is exist then query currency is exist?');
						trustline.findAll({where:{currency:json['currency']}}).complete(function(err,response){
						if(!err)
						{
                                        		if(response[0]) //trustline exist
							{
								console.log('after query, currency id:' + response[0].selectedValues.id);
gatewayd.logger.info('after query, currency id:' + response[0].selectedValues.id);
								var cmdStr = 'node ./payment-error.js';
								exec(cmdStr, function(err,stdout,stderr){
   								if(err) {
        								console.log('******nodejs payment-error error:*********'+stderr);
gatewayd.logger.info('******nodejs payment-error error:*********'+stderr);
    								} 
   								else {
									console.log('******nodejs payment-error success:*********'+stderr);
gatewayd.logger.info('******nodejs payment-error success:*********'+stderr);
    								}
								});
                                        		}
							else    //trustline not exist
							{
								console.log("currency is not exist ,insert custom currency");
								console.log(json['currency']);
								console.log(json['address']);
								console.log(json['amount']);
								trustline.create({currency:json['currency'],By:json['address'],Amount:json['amount']});

								var cmdStr = 'node ./payment-ok.js ';
console.log(cmdStr);
								exec(cmdStr, function(err,stdout,stderr){
   								if(err) {
        								console.log('******nodejs payment-ok error:*********'+stderr);
gatewayd.logger.info('******nodejs payment-ok success:*********'+stderr);
    								} 
   								else {
									console.log('******nodejs payment-ok success:*********'+stderr);}
gatewayd.logger.info('******nodejs payment-ok success:*********'+stderr);
								});
							}//else
						}//if(!err)

					});
			 		}//end if
    			});
			//}
		}	
	}
}
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
