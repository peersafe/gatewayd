var queue = require('../lib/withdrawal_payments_queue.js');

var config = require('../config/nconf.js');
var abstract = require('../lib/abstract.js');
var api = require("ripple-gateway-data-sequelize-adapter");
var sql = require('../node_modules/ripple-gateway-data-sequelize-adapter/lib/sequelize.js');

queue.on('payment:withdrawal', function(payment) {

  console.log('received a new payment event');
  console.log(payment.toJSON());

  
  api.rippleAddresses.read(payment.from_address_id, function(err, address) {
    
    if (err || !address) {
      console.log('no address found');
      return;
    }

    console.log(address);
      
    sql.transaction(function(t) {

      api.externalTransactions.create({
        deposit: false,
        amount: payment.to_amount * 0.99,
        currency: payment.to_currency,
        status: 'pending',
        ripple_transaction_id: payment.id,
        external_account_id: address.tag
      }, function(err, withdrawal) {

        console.log(err, withdrawal);
        
        if (err) {
          t.rollback();
          return;
        } 
        
        api.rippleTransactions.update({
          id: payment.id,
          transaction_state: 'tesSUCCESS'
        }, function(err, rippleTransaction) {

          if (err) {
            t.rollback();
            return;
          } else {
            if (rippleTransaction.transaction_state == 'incoming') {
              t.rollback();
              return;
            } 
            t.commit();
            console.log('commit!');
          }

        })
      });
    });
  });
});

queue.work();
