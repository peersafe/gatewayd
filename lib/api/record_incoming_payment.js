const Promise            = require('bluebird');
const config             = require(__dirname + '/../../config/environment.js');
const getHostedAddress   = require(__dirname + '/get_hosted_address.js');
const RippleTransactions = require(__dirname + '/../data/').models.rippleTransactions;
const RippleAddresses    = require(__dirname + '/../data/').models.rippleAddresses;

/**
 * Record incoming payment
 * @requires config, getHostedAddress, Promise, RippleTransactions, RippleAddresses
 * @param {integer} destination_tag
 * @param {decimal} destination_amount.amount
 * @param {string} destination_amount.currency
 * @param {string} destination_amount.issuer
 * @param {string} source_account
 * @param {integer} source_tag
 * @param {decimal} source_amount.amount
 * @param {string} source_amount.currency
 * @param {string} source_amount.issuer
 * @param {string} transaction_state
 * @param {string} state
 * @param {string} hash
 * @param {string} invoice_id
 * @param {array} memos
 * @returns {Promise}
 */
function recordIncomingPayment(options) {
  // Check if an 'invoiced' transaction already exists
  return new Promise(function(resolve, reject) {
    RippleTransactions.find({
      where: {
        state: 'invoice',
        invoice_id: options.invoice_id,
        direction: 'from-ripple'
      }
    }).then(function (rippleTransaction) {
      if (rippleTransaction) {
        _updateInvoicedRippleTransaction(rippleTransaction, options)
          .then(resolve)
          .error(function (error) {
            logger.error('[record_incoming_payment.js:recordIncomingPayment] Failed to update ripple_transaction [%j] with fields [%j], ERROR: ' + error, rippleTransaction, options);
            return reject(new Error('Failed to update ripple_transaction record'));
          });
      } else {
        _createIncomingRippleTransaction(options)
          .then(resolve)
          .error(function(error) {
            logger.error('[record_incoming_payment.js:recordIncomingPayment] Failed to create ripple_transaction with fields [%j], ERROR: ' + error, options);
            return reject(new Error('Failed to create ripple_transaction record'));
          });
      }
    }).error(function (error) {
      logger.error('[record_incoming_payment.js:recordIncomingPayment] Failed to query ripple_transactions table, ERROR: ' + error);
      return reject(new Error('Failed to query ripple_transactions table'));
    });
  });
}

function _updateInvoicedRippleTransaction(rippleTransaction, incomingPayment) {
  return rippleTransaction.updateAttributes({
    to_amount: incomingPayment.to_amount,
    to_currency: incomingPayment.to_currency,
    to_issuer: incomingPayment.to_issuer,
    from_amount: incomingPayment.from_amount,
    from_currency: incomingPayment.from_currency,
    from_issuer: incomingPayment.from_issuer,
    transaction_state: incomingPayment.transaction_state,
    state: incomingPayment.state,
    transaction_hash: incomingPayment.hash,
    memos: incomingPayment.memos
  });
}

function _createIncomingRippleTransaction(incomingPayment) {
  return Promise.props({
    sourceRecord: RippleAddresses.findOrCreate({
      address: incomingPayment.source_account,
      tag: incomingPayment.source_tag,
      managed: false,
      type: incomingPayment.source_tag ? 'hosted' : 'independent'
    }),
    destinationRecord: getHostedAddress(incomingPayment.destination_tag)
  }).then(function (result) {
    return RippleTransactions.create({
      to_address_id: result.destinationRecord.id,
      to_amount: incomingPayment.destination_amount.value,
      to_currency: incomingPayment.destination_amount.currency,
      to_issuer: config.get('COLD_WALLET'),
      from_address_id: result.sourceRecord.id,
      from_amount: incomingPayment.source_amount.value,
      from_currency: incomingPayment.source_amount.currency,
      from_issuer: incomingPayment.source_amount.issuer || '',
      transaction_state: incomingPayment.transaction_state,
      state: incomingPayment.state,
      transaction_hash: incomingPayment.hash,
      invoice_id: incomingPayment.invoice_id,
      memos: incomingPayment.memos,
      direction: 'from-ripple'
    });
  });
}

module.exports = recordIncomingPayment;

