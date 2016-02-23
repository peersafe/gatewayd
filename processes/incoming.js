var Promise                 = require('bluebird');
var gatewayd                = require(__dirname+'/../');
var RippleAccountMonitor    = require('ripple-account-monitor');
var IncomingPayment         = require(__dirname+'/../lib/core/incoming_payment.js');
const coldWallet            = gatewayd.config.get('COLD_WALLET');  //const
const rippleRestBaseUrl     = gatewayd.config.get('RIPPLE_REST_API'); //const
var exec = require('child_process').exec; 
var RippleAPI = require('ripple-lib').RippleAPI; //const
var trustline = require('../lib/core/trustline.js');
var exec = require('child_process').exec; 
var hash =  require('../payment-hash.js');
var moment = require('moment');

//当客户端添加TRUSTLINE时，这里被触发
function Monitor(gatewayd) {
  return new RippleAccountMonitor({
    rippleRestUrl: rippleRestBaseUrl,
    account: coldWallet,
    onTransaction: function(transaction, next) {
      gatewayd.api.setLastPaymentHash(transaction.hash)
        .then(function(hash){
  				console.log(transaction.LimitAmount.currency);
					console.log(transaction.TransactionType);
					if(transaction.TransactionType == 'TrustSet')
					{
	  		  	trustline.findAll({where:{CurrencyName:transaction.LimitAmount.currency}}).complete(function(err,response){
							if(!err){
								trustline.findAll({where:{CurrencyName:transaction.LimitAmount.currency}}).complete(function(err,response){
									if(!err){
										console.log('begin to query db');
	    							trustline.findAll({where:{CurrencyName:transaction.LimitAmount.currency}}).complete(function(err,response){
											if(!err){
												var timestr = moment().format("YYYY-MM-DD HH:mm:ss");
												console.log("time:"+timestr);
												trustline.update({CurrencyCreateTime:timestr,CurrencySend:true}).then(function(){
													console.log('save success and then verify it value');
													trustline.findAll({where:{CurrencyName:transaction.LimitAmount.currency}}).complete(function(err,response){
														if(!err){ 
															if(response[0]){
																console.log('query success and createtime is :' + response[0].selectedValues.CurrencyCreateTime);
																console.log('currencysend flag is :' + response[0].selectedValues.CurrencySend);
															}
														}
													});
												});
											}
					  				});
									}
								});
				        //自动分配初始份额的资产给客户
								gatewayd.logger.log("I will sent "+response[0].dataValues.Amount + " "+ transaction.LimitAmount.currency + "to client :" + response[0].dataValues.By);
								var cmdStr = 'node -harmony ./payment-trustline.js ' + response[0].dataValues.CurrencyOwner +' ' + transaction.LimitAmount.currency + ' ' + response[0].dataValues.CurrencyAmount;
								console.log(cmdStr);
								exec(cmdStr, function(err,stdout,stderr){
   								if(err) {
										gatewayd.logger.info('******nodejs payment-trustline error:*********'+stderr);} 
   								else {
										gatewayd.logger.info('******nodejs payment-trustline success:*********'+stderr);
    							}
								});
							}
						});
					}
  				gatewayd.logger.info('setLastPaymentHash payment:hash set to:', hash);
  				next();
  			})
    		.error(function(error) {
          gatewayd.logger.error('payment:set last payment hash:error', error);
          next();
        });
    },
    onPayment: function(paymentNotification, next) {
      var incomingPayment = new IncomingPayment(paymentNotification);
      incomingPayment.processPayment()
        .then(function(processedPayment){
          gatewayd.logger.info('payment:incoming:recorded', JSON.stringify(processedPayment));
          next();
        })
        .error(function(error){
          gatewayd.logger.error('payment:incoming:error', error);
          next();
        });
    },
		//GATEWAYD依赖交易HASH监听网络上的交易，如果HASH错误，这里设置正确的HASH
    onError: function(error) {
    	if(hash._d.v) 
			{
				gatewayd.logger.info('want set to hash:' + hash._d.v);

				cmdStr = '/home/shuangquan/work/gatewayd/bin/gateway set_last_payment_hash '+ hash._d.v;
				console.log(cmdStr);
				exec(cmdStr, function(err,stdout,stderr){
    			if(err) {
						gatewayd.logger.info('*********set_last_payment_hash error*****************');
        		console.log(stderr);
    			} 
    			else {
						gatewayd.logger.info('*********set_last_payment_hash success*****************');
        		process.exit(0);
    			}
				});
			}
    }
  });
}

function start(gatewayd) {
gatewayd.logger.info('--------start incoming-------------');
var monitor = new Monitor(gatewayd);
debugger;
  gatewayd.api.getOrFetchLastPaymentHash()
    .then(function(paymentHash){
      monitor.lastHash = paymentHash;
      monitor.start();
      gatewayd.logger.info("conenect at ",rippleRestBaseUrl);
      gatewayd.logger.info("coldWallet : ",coldWallet);
      gatewayd.logger.info('Listening for incoming ripple payments from Ripple REST, starting at', monitor.lastHash);
    });
}

if (gatewayd.features.isEnabled('supervisor')) {
  module.exports = function(gatewayd) {
    start(gatewayd);
  };
} else {
  Error.stackTraceLimit = Infinity;
  process.on('uncaughtException', function(err) {
    gatewayd.logger.error('Caught exception: ' + err);
  });
  Promise.onPossiblyUnhandledRejection(function(err) {
    gatewayd.logger.error('Caught exception: ' + err);
  });
  start(gatewayd);
}

