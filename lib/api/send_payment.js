var RippleRestClient  = require('ripple-rest-client');
var uuid              = require('node-uuid');
var config            = require(__dirname+'/../../config/environment.js');

var rippleRestClient = new RippleRestClient({
  api: config.get('RIPPLE_REST_API'),
  account: config.get('COLD_WALLET')
});

function sendpayment(amount,currency,destination,callback) {
  var payment = {
  amount:amount,
  currency:currency
	}
  var options = {
    secret: 'snSPUYTbHHKmYBdt66JBpq3Liihi1',
    client_resource_id: uuid.v4(),
    payment: {
      destination_account: destination,
      source_account: config.get('HOT_WALLET').address,
      destination_amount: {
        value: payment.amount.toString(),
        currency: payment.currency,
        issuer:payment.issuer||''
      }
    }
  };

console.log(options.payment.destination_amount.value);

  rippleRestClient.sendAndConfirmPayment(options, function(error, response){
    if (error || (response.result !== 'tesSUCCESS')) {
       console.log(error);
    }
    callback(null, response);
  });
}

module.exports = sendpayment;

