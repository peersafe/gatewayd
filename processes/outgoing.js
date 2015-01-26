var SqlMqWorker = require('sql-mq-worker');
var OutgoingPaymentProcessor = require(__dirname+'/../lib/core/outgoing_payment_processor.js');
var gatewayd = require(__dirname+'/../');

function worker(gatewayd) {
  return new SqlMqWorker({
    Class: gatewayd.data.models.rippleTransactions,
    predicate: { where: {
      state: 'outgoing',
      direction: 'to-ripple'
    }},
    job: function(outgoingPayment, callback) {
      var outgoingPaymentProcessor = new OutgoingPaymentProcessor(outgoingPayment);
      outgoingPaymentProcessor.processOutgoingPayment(callback);
    }
  });
}

if (gatewayd.features.isEnabled('supervisor')) {
  module.exports = function(gatewayd) {
    worker(gatewayd).start();
  };
} else {
  process.on('uncaughtException', function(error) {
    gatewayd.logger.error('exception', error);
    gatewayd.logger.error('exception:stack', error.stack);
    process.exit();
  });
  worker(gatewayd).start();
}

