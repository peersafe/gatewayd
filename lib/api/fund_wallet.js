var RippleRestClient  = require('ripple-rest-client');
var uuid              = require('node-uuid');
var config            = require(__dirname+'/../../config/environment.js');

var rippleRestClient = new RippleRestClient({
  api: config.get('RIPPLE_REST_API'),
  account: config.get('COLD_WALLET')
});

function fundWallet(payment, destination,callback) {
  var options = {
    secret: payment.secret,
    client_resource_id: uuid.v4(),
    payment: {
      destination_account: destination,
      source_account: config.get('HOT_WALLET').address,
      destination_amount: {
        value: payment.amount.toString(),
        currency: payment.currency,
        issuer: payment.issuer || ''
      }
    }
  };

  rippleRestClient.sendAndConfirmPayment(options, function(error, response){
    if (error || (response.result !== 'tesSUCCESS')) {
       console.log(error);
    }
    callback(null, response);
  });
}

module.exports = fundWallet;
