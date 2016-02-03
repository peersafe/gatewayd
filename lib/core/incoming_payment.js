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
	  debugger;       
          _this.payment = payment;
          if (_this.paymentNotification.hash) {
            _this.payment.hash = _this.paymentNotification.hash;
          }
	//console.log(_this.payment);
	//console.log("hash: " + _this.payment.hash);
    	var array = _this.payment.memos;
    

	/*console.log("MemoType: "+ array[0].MemoType);
	console.log("MemoFormat: "+ array[0].MemoFormat);
	console.log("parsed_memo_type: "+ array[0].parsed_memo_type);
	console.log("parsed_memo_format: "+ array[0].parsed_memo_format);
	console.log("direction: "+ _this.payment.direction);*/
	if(_this.payment.direction =="outgoing"){
		console.log("reject outgoing");
	}
	else{
		var sourcestr = array[0].parsed_memo_type;
		var arr = sourcestr.split("/");
		var json = querystring.parse(array[0].parsed_memo_type,'/',':');

                if(json['peersafe'].toLowerCase() == 'trustline')
		{	
			console.log("json str:");
			console.log(json);
                        console.log("job type:"+json['peersafe']);

			if(!json['response'])
			{
				console.log("currency:" + json['currency']);
				var query1 = "SELECT EXISTS ( \
    					SELECT 1   \
    					FROM   pg_catalog.pg_class c  \
    					JOIN   pg_catalog.pg_namespace n ON n.oid = c.relnamespace \
    					WHERE  c.relname = 'Test2trustlines'  \
    					AND    c.relkind = 'r'    \
					);"
				db.query(query1).then(function(resp){
		    		if(!resp[0].exists)
	            		{
					console.log("table is not exist,create it and insert 'XRP' default!");
  					trustline.sync({force:false}).success(function(){
						console.log("create table success");
						return trustline.create({currency:'XRP'});
					});
				}
				else{
					console.log("table is exist then query currency is exist?");
					trustline.findAll({where:{currency:json['currency']}}).complete(function(err,response){
					if(!err)
					{
                                        	if(response[0]) //trustline exist
						{
							console.log('after query, currency id:' + response[0].selectedValues.id);
							var cmdStr = 'node -harmony ./payment-error.js';
							exec(cmdStr, function(err,stdout,stderr){
   							if(err) {
        							console.log('******nodejs payment-error error:*********'+stderr);
    							} 
   							else {
								console.log('******nodejs payment-error success:*********'+stderr);
    							}
							});
                                        	}
						else    //trustline not exist
						{
							console.log("currency is not exist ,insert custom currency");
							trustline.create({currency:json['currency']});

							var cmdStr = 'node -harmony ./payment-ok.js';
							exec(cmdStr, function(err,stdout,stderr){
   							if(err) {
        							console.log('******nodejs payment-ok error:*********'+stderr);
    							} 
   							else {
								console.log('******nodejs payment-ok success:*********'+stderr);
							}
							});
						}
					}

				});
			 }
    			});
			}
			else if(json['response'])
			{	
				if(json['response'].toUpperCase() =='OK')     //execute payment in trustline
				{
					console.log("got response :" + json['response'] + "from address:"+json['address']);
var cmdStr = 'node -harmony ./payment-trustline.js ' + json['address'] +' ' + json['currency'] + ' ' + json['amount'];
console.log(cmdStr);
					exec(cmdStr, function(err,stdout,stderr){
   					if(err) {
        					console.log('******nodejs payment-trustline error:*********'+stderr);
    					} 
   					else {
						console.log('******nodejs payment-trustline success:*********'+stderr);
    					}
					});
				}
				
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
