'use strict';
const RippleAPI = require('ripple-lib').RippleAPI;
var config = require(__dirname + '/../../config/environment.js');
var rippled_servers = config.get('RIPPLED_SERVERS');


console.log(rippled_servers);

const api = new RippleAPI({ server: rippled_servers });

const instructions = { maxLedgerVersionOffset: 5 };

//const root_address = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
//const root_secret = 'snoPBrXtMeMyMHUVTgbuqAfg1SUTb';
const root_address = config.get('HOT_WALLET').address;
const root_secret = config.get('HOT_WALLET').secret;

function sendpayment_lib(address, currency, amount) {

    const payment = {
        source: {
            address: config.get('HOT_WALLET').address,
            maxAmount: {
                value: '300000',
                currency: currency
            }
        },
        destination: {
            address: address,
            amount: {
                value: amount.toString(),
                currency: currency
            }
        },
        memos: [
          {
              type: '',
              format: '',
              data: ''
          }
        ]
    };
    console.log(payment);
    function quit(message) {
        console.log(message);
        //process.exit(0);
    }

    function fail(message) {
        console.error(message);
        //process.exit(1);
    }

    api.connect().then(() => {
        console.log('Connected...');
        return api.preparePayment(root_address, payment, instructions).then(prepared => {
            console.log('Payment transaction prepared...');
            console.log(prepared.txJSON);
            var signedRet = api.sign(prepared.txJSON, root_secret);
            console.log(signedRet);
            console.log('Payment transaction signed...');
            api.submit(signedRet.signedTransaction).then(
            quit, fail);
        });
    }).catch(fail);

}

module.exports = sendpayment_lib;

