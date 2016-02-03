'use strict';
const RippleAPI = require('ripple-lib').RippleAPI;

const api = new RippleAPI({ server: 'ws://182.254.219.210:6006' });

const instructions = {maxLedgerVersionOffset: 5};

const address = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
const secret = 'snoPBrXtMeMyMHUVTgbuqAfg1SUTb';

const payment = {
  source: {
      address: address,
    maxAmount: {
      value: '300000',
      currency: 'XRP'
    }
  },     
  destination: {
      address: 'rDKPKRBCYwkGujovZsGK5pmrvEbuqc3AHm',
    amount: {
      value: '0.0001',
      currency: 'XRP'
    }
},
  memos: [
    {
      type: 'peersafe/trustline/response:error',
      format: '',
      data: ''
    }
  ]
};

function quit(message) {
  console.log(message);
  process.exit(0);
}

function fail(message) {
  console.error(message);
  process.exit(1);
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


