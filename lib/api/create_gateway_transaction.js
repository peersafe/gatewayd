var Promise                  = require('bluebird');
var GatewayTransaction       = require(__dirname+'/../data/').models.gatewayTransactions;
var createRipplePayment      = require(__dirname+'/create_ripple_payment');
var createExternalPayment    = require(__dirname+'/create_external_payment');

function createGatewayTransaction(options) {
  return new Promise(function(resolve, reject) {
    var direction = options.direction;
    var input, output, ripple, external;

    if (direction === 'to-ripple') {
      input            = options.external;
      input.state      = 'invoice';
      output           = options.ripple;
      output.state     = 'invoice';
      output.direction = 'to-ripple';

      createRipplePayment(output)
        .then(function(rippleTransaction) {
          ripple = rippleTransaction;
          input.direction = 'incoming';
          input.ripple_transaction_id = rippleTransaction.id;
          return createExternalPayment(input);
        })
        .then(function(externalTransaction) {
          external = externalTransaction;
          return GatewayTransaction.create({
            state: 'invoice',
            direction: direction,
            ripple_transaction_id: ripple.id,
            external_transaction_id: external.id,
            policy_id: 0
          });
        })
        .then(function(gatewayTransaction) {
          gatewayTransaction.rippleTransaction = ripple;
          gatewayTransaction.externalTransaction = external;
          resolve(gatewayTransaction);
        })
        .error(reject);

    } else if (direction === 'from-ripple') {
      input  = options.ripple;
      input.state = 'invoice';
      output = options.external;
      output.state = 'invoice';
      output.direction = 'outgoing';

      createExternalPayment(output)
        .then(function(externalTransaction) {
          external = externalTransaction;
          input.direction = 'from-ripple';
          input.external_transaction_id = externalTransaction.id;
          return createRipplePayment(input);
        })
        .then(function(rippleTransaction) {
          ripple = rippleTransaction;
          return GatewayTransaction.create({
            state: 'invoice',
            direction: direction,
            ripple_transaction_id: rippleTransaction.id,
            external_transaction_id: external.id,
            policy_id: 0
          });
        })
        .then(function(gatewayTransaction) {
          gatewayTransaction.rippleTransaction = ripple;
          gatewayTransaction.externalTransaction = external;
          resolve(gatewayTransaction);
        })
        .error(reject);
    } else {
      reject(new Error('direction must be to-ripple or from-ripple'));
    }
  });
}

module.exports = createGatewayTransaction;
