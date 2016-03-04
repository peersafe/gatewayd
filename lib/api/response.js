'use strict';
const RippleAPI = require('ripple-lib').RippleAPI;
var config = require(__dirname + '/../../config/environment.js');

var rippled_servers = config.get('RIPPLED_SERVERS');
const api = new RippleAPI({ server: rippled_servers });

/*需要和当前目录下send_payment.js统一，但没找到restclient添加附加字节的方法，所以暂时这样，待以后统一*/
function response(memos, destaddress) {
    const instructions = { maxLedgerVersionOffset: 5 };

    const address = config.get('HOT_WALLET').address;
    const secret = config.get('HOT_WALLET').secret;

    const payment = {
        source: {
            address: address,
            maxAmount: {
                value: '300000',
                currency: 'XRP'
            }
        },
        destination: {
            address: destaddress,
            amount: {
                value: '0.0001',
                currency: 'XRP'
            }
        },
        memos: memos
    };
    payment.memos[0].data = JSON.stringify(payment.memos[0].data);
    function quit(message) {
        console.log(message);
        console.log('response message!:' + param);
        //process.exit(0);
    }

    function fail(message) {
        console.error(message);
        //process.exit(1);
    }

    api.connect().then(() => {
        console.log('Connected...');
        return api.preparePayment(address, payment, instructions).then(prepared => {
            console.log('Payment transaction prepared...');
            console.log(prepared.txJSON);
            var signedRet = api.sign(prepared.txJSON, secret);
            console.log(signedRet);
            console.log('Payment transaction signed...');
            api.submit(signedRet.signedTransaction).then(
            quit, fail);
        });
    }).catch(fail);
}
module.exports = response;


