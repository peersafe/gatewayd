var Promise = require('bluebird');
var gatewayd = require(__dirname + '/../');
var RippleAccountMonitor = require('ripple-account-monitor');
var IncomingPayment = require(__dirname + '/../lib/core/incoming_payment.js');
const coldWallet = gatewayd.config.get('COLD_WALLET');  //const
const rippleRestBaseUrl = gatewayd.config.get('RIPPLE_REST_API'); //const
var RippleAPI = require('ripple-lib').RippleAPI; //const
var send_payment = require('../lib/api/send_payment.js');

//当客户端添加TRUSTLINE时，这里被触发
function Monitor(gatewayd) {
    return new RippleAccountMonitor({
        rippleRestUrl: rippleRestBaseUrl,
        account: coldWallet,
        onTransaction: function (transaction, next) {
            gatewayd.api.setLastPaymentHash(transaction.hash)
              .then(function (hash) {
                  console.log(transaction.LimitAmount.currency);
                  console.log(transaction.TransactionType);
                  if (transaction.TransactionType == 'TrustSet') {
                      gatewayd.data.assets.read({ code: transaction.LimitAmount.currency }, function (err, response) {
                          console.log('query result:');
                          console.log("transaction.Account address:" + transaction.Account);
                          console.log("response.dataValues.owner address:" + response.dataValues.owner);
                          if (transaction.Account == response.dataValues.owner) { //比较地址是否和初始创建者一样
                              console.log("address ==");
                              if (response.dataValues.status == 0) {
                                  console.log('status = 0 then send money ');
                                  gatewayd.data.assets.update({ status: 1 }, function (err, res) {
                                      console.log('save success');
                                      //自动分配初始份额的资产给客户
                                      send_payment(response.dataValues.amount, transaction.LimitAmount.currency, response.dataValues.owner, function (err, response) {
                                          if (err) {
                                              gatewayd.logger.info('******send_payment error:*********');
                                          } else {
                                              gatewayd.logger.info('******send_payment success:*********');
                                          }
                                      });
                                  });
                              }

                          }
                          else {
                              console.log("address !=");
                          }
                      });//end if				
                  }
                  gatewayd.logger.info('setLastPaymentHash payment:hash set to:', hash);
                  next();
              })
              .error(function (error) {
                  gatewayd.logger.error('payment:set last payment hash:error', error);
                  next();
              });
        },
        onPayment: function (paymentNotification, next) {
            var incomingPayment = new IncomingPayment(paymentNotification);
            incomingPayment.processPayment()
              .then(function (processedPayment) {
                  gatewayd.logger.info('payment:incoming:recorded', JSON.stringify(processedPayment));
                  next();
              })
              .error(function (error) {
                  gatewayd.logger.error('payment:incoming:error', error);
                  next();
              });
        },
        onError: function (error) {
        }
    });
}

function start(gatewayd) {
    gatewayd.logger.info('--------start incoming-------------');
    var monitor = new Monitor(gatewayd);
    debugger;
    gatewayd.api.getOrFetchLastPaymentHash()
      .then(function (paymentHash) {
          monitor.lastHash = paymentHash;
          monitor.start();
          gatewayd.logger.info("conenect at ", rippleRestBaseUrl);
          gatewayd.logger.info("coldWallet : ", coldWallet);
          gatewayd.logger.info('Listening for incoming ripple payments from Ripple REST, starting at', monitor.lastHash);
          console.log('start');
      });
}

if (gatewayd.features.isEnabled('supervisor')) {
    module.exports = function (gatewayd) {
        start(gatewayd);
    };
} else {
    Error.stackTraceLimit = Infinity;
    process.on('uncaughtException', function (err) {
        gatewayd.logger.error('Caught exception: ' + err);
    });
    Promise.onPossiblyUnhandledRejection(function (err) {
        gatewayd.logger.error('Caught exception: ' + err);
    });
    start(gatewayd);
}

