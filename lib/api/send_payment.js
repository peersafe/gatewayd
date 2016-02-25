var RippleRestClient  = require('ripple-rest-client');
var uuid              = require('node-uuid');
var config            = require(__dirname+'/../../config/environment.js');

var rippleRestClient = new RippleRestClient({
  api: config.get('RIPPLE_REST_API'),
  account: config.get('HOT_WALLET').address
});

function sendPayment(amount, currency, destination, callback) {
  var options = {
    secret: config.get('HOT_WALLET').secret,
    client_resource_id: uuid.v4(),
    payment: {
      destination_account: destination,
      source_account: config.get('HOT_WALLET').address,
      destination_amount: {
        value: amount.toString(),
        currency: currency
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

module.exports = sendPayment;

