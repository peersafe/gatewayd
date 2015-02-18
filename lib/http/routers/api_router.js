var express = require('express');

var apiController = require(__dirname+'/../controllers/api/');

var router = new express.Router();

router.post('/payments/outgoing', apiController.enqueueOutgoingPayment);
router.post('/config', apiController.configureGatewayd);
router.get('/balances', apiController.getAccountBalance);
router.get('/liabilities', apiController.getLiabilities);
router.get('/quotes/ripple/incoming', apiController.rippleQuotesIncoming);
router.get('/quotes/ripple/outgoing', apiController.rippleQuotesOutgoing);

module.exports = router;

