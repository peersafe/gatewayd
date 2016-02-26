'use strict';
const RippleAPI = require('ripple-lib').RippleAPI;
var config = require(__dirname + '/../../config/environment.js');
const api = new RippleAPI({ server: 'ws://182.254.219.210:6006' });

/*��Ҫ�͵�ǰĿ¼��send_payment.jsͳһ����û�ҵ�restclient��Ӹ����ֽڵķ�����������ʱ���������Ժ�ͳһ*/
function response(param, destaddress) {
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
        memos: [
          {
              type: 'response',
              format: '',
              data: param
          }
        ]
    };

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


