var Promise                 = require('bluebird');
var gatewayd                = require(__dirname+'/../');
var RippleAccountMonitor    = require('ripple-account-monitor');
var IncomingPayment         = require(__dirname+'/../lib/core/incoming_payment.js');
var coldWallet            = gatewayd.config.get('COLD_WALLET');  //const
var rippleRestBaseUrl     = gatewayd.config.get('RIPPLE_REST_API'); //const
var exec = require('child_process').exec; 
var RippleAPI = require('ripple-lib').RippleAPI; //const
var hash =  require('../payment-hash.js');
var trustline = require('../lib/core/trustline.js');
var exec = require('child_process').exec; 

function Monitor(gatewayd) {
  return new RippleAccountMonitor({
    rippleRestUrl: rippleRestBaseUrl,
    account: coldWallet,
    onTransaction: function(transaction, next) {
      gatewayd.api.setLastPaymentHash(transaction.hash)
        .then(function(hash){
debugger;
	console.log(transaction.LimitAmount.currency);
	if(transaction.TransactionType == 'TrustSet')
	{
	    	trustline.findAll({where:{currency:transaction.LimitAmount.currency}}).complete(function(err,response)
		{
			if(!err)
			{
					console.log("I will sent "+response[0].dataValues.Amount + " "+ transaction.LimitAmount.currency + "to client :" + response[0].dataValues.By);
					var cmdStr = 'node -harmony ./payment-trustline.js ' + response[0].dataValues.By +' ' + transaction.LimitAmount.currency + ' ' + response[0].dataValues.Amount;
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
		});
	}
          gatewayd.logger.info('setLastPaymentHash payment:hash set to:', hash);
          next();
        })
        .error(function(error) {
 	  debugger;
          gatewayd.logger.error('payment:set last payment hash:error', error);
          next();
        });
    },
    onPayment: function(paymentNotification, next) {
debugger;
      var incomingPayment = new IncomingPayment(paymentNotification);
      incomingPayment.processPayment()
        .then(function(processedPayment){
          //gatewayd.logger.info('payment:incoming:recorded', JSON.stringify(processedPayment));
          next();
        })
        .error(function(error){
          //gatewayd.logger.error('payment:incoming:error', error);
          next();
        });
    },
    onError: function(error) {
    	if(hash._d.v) 
	{
		console.log("want set to hash:" + hash._d.v);

		cmdStr = '/home/shuangquan/work/gatewayd/bin/gateway set_last_payment_hash '+ hash._d.v;
		console.log(cmdStr);
		exec(cmdStr, function(err,stdout,stderr){
    			if(err) {
        			console.log('***************set_last_payment_hash error:***********');
        			console.log(stderr);
    			} 
    			else {
				console.log("*********set_last_payment_hash success*****************");
				gatewayd.logger.info('*********set_last_payment_hash success*****************');
                        	process.exit(0);
    			}
		});
	}
    }
  });
}

function start(gatewayd) {
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

