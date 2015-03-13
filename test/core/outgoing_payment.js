process.env.NODE_ENV = 'test_in_memory';
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const gatewayd = require(__dirname+'/../../');
const OutgoingPayment = require(__dirname+'/../../lib/core/outgoing_payment.js');
var fixturesRippleRestIntegration = require(__dirname+'/../fixtures/ripple_rest_integration.js');
var fixturesOutgoingPayment = require(__dirname+'/../fixtures/outgoing_payments.js');
var RippleTransactions = gatewayd.models.rippleTransactions;

describe('Outgoing Payment', function() {
  chai.use(chaiAsPromised);

  beforeEach(function(done) {
    gatewayd.database.sync({force: true}).then(function() {
      done();
    });
  });

  describe('Ripple REST error handler', function(){

    it('should handle insufficient fund error and mark record failed', function(done) {
      RippleTransactions
        .create(fixturesOutgoingPayment.requests.outgoing_record)
        .then(function (rippleTransaction) {
          var outgoingPayment = new OutgoingPayment(rippleTransaction);
          return outgoingPayment._rippleRestResponseHandler(fixturesRippleRestIntegration.errors.insufficient_funds)
            .then(function(handledError){
              chai.assert.strictEqual(handledError.record.state, 'failed');
              chai.assert.strictEqual(handledError.record.transaction_state, 'terINSUF_FEE_B');
              done();
            })
        })
        .error(done);
    });

    it('should handle transaction not found -- retry', function(done) {
      RippleTransactions
        .create(fixturesOutgoingPayment.requests.outgoing_record)
        .then(function (rippleTransaction) {
          var outgoingPayment = new OutgoingPayment(rippleTransaction);
          return outgoingPayment._rippleRestResponseHandler(fixturesRippleRestIntegration.errors.invalid_requests.transaction_not_found)
            .then(function(handledError){

              chai.assert.strictEqual(handledError.record.state, 'outgoing');
              chai.assert.strictEqual(handledError.handled, 'retry');
              done();
            })
        })
        .error(done);
    });



    it('should handle no path found -- failed', function(done) {

      RippleTransactions
        .create(fixturesOutgoingPayment.requests.outgoing_record)
        .then(function (rippleTransaction) {

          var outgoingPayment = new OutgoingPayment(rippleTransaction);

          outgoingPayment._rippleRestResponseHandler(fixturesRippleRestIntegration.errors.invalid_requests.no_paths_found)
            .then(function(handledError){
              chai.assert.strictEqual(handledError.record.transaction_state, 'tecPATH_DRY');
              chai.assert.strictEqual(handledError.record.state, 'failed');
              done();
            });
        });
    });

  });

  it('should handle no rippled connection error -- retry', function(done) {

    RippleTransactions
      .create(fixturesOutgoingPayment.requests.outgoing_record)
      .then(function (rippleTransaction) {
        var outgoingPayment = new OutgoingPayment(rippleTransaction);
        return outgoingPayment._rippleRestResponseHandler(fixturesRippleRestIntegration.errors.connection.no_rippled_connection)
          .then(function(handledError){
            chai.assert.strictEqual(handledError.handled, 'retry');
            done();
          })
      })
      .error(done);
  });

  it('should handle rippled busy error -- retry', function(done) {

    RippleTransactions
      .create(fixturesOutgoingPayment.requests.outgoing_record)
      .then(function (rippleTransaction) {
        var outgoingPayment = new OutgoingPayment(rippleTransaction);
        return outgoingPayment._rippleRestResponseHandler(fixturesRippleRestIntegration.errors.connection.rippled_busy)
          .then(function(handledError){
            chai.assert.strictEqual(handledError.handled, 'retry');
            done();
          })
      })
      .error(done);
  });

  it('should handle socket hang up connection error -- retry', function(done) {
    var error = new Error('socket hang up');
    error.code = 'ECONNRESET';

    RippleTransactions
      .create(fixturesOutgoingPayment.requests.outgoing_record)
      .then(function (rippleTransaction) {
        var outgoingPayment = new OutgoingPayment(rippleTransaction);
        return outgoingPayment._rippleRestResponseHandler(error)
          .then(function(error){
            chai.assert.strictEqual(error.handled, 'retry');
            done();
          })
      })
      .error(done);
  });

});


describe('Sending a queued payment to ripple', function() {
  beforeEach(function(done) {
    gatewayd.database.sync({force: true}).then(function() {
      done();
    });
  });

  it('should record the rejection of a payment from the Ripple Ledger', function(done) {

    RippleTransactions
      .create(fixturesOutgoingPayment.requests.outgoing_record)
      .then(function (rippleTransaction) {
        var outgoingPayment = new OutgoingPayment(rippleTransaction);
        var confirmationResponse = new Object(fixturesRippleRestIntegration.successful_responses.validated_payment);
        confirmationResponse.result = 'temPATH_DRY';

        return outgoingPayment._recordAcceptanceOrRejectionStatus(confirmationResponse)
          .then(function(status) {
            chai.assert.strictEqual(outgoingPayment.record.state, 'failed');
            done();
          })
      })
      .error(done);
  });

  it.skip('should send a ripple payment, response must have a status url', function(done){
    this.timeout(10000);
    RippleTransactions
      .create(fixturesOutgoingPayment.requests.outgoing_record)
      .then(function (rippleTransaction) {
        var outgoingPayment = new OutgoingPayment(rippleTransaction);
        return outgoingPayment._sendPayment(fixturesRippleRestIntegration.requests.payment)
          .then(function(payment){
            chai.assert(payment.success);
            chai.assert(payment.status_url);
            done();
          })
      })
      .error(done);
  });

  it('should prepare payment with source/destination currencies', function(done){
    this.timeout(10000);

    var outgoingPayment = new OutgoingPayment(fixturesOutgoingPayment.requests.outgoing_record);
    outgoingPayment
      ._buildPayment(fixturesOutgoingPayment.requests.ripple_address)
      .then(function(prepared){
        chai.assert.deepEqual(fixturesOutgoingPayment.responses.success.prepared_payment, prepared);
        done();
      })
      .error(done);

  });

  it('should mark record pending while a payment is being confirmed', function(done){
    this.timeout(10000);
    RippleTransactions
      .create(fixturesOutgoingPayment.requests.outgoing_record)
      .then(function (rippleTransaction) {
        var outgoingPayment = new OutgoingPayment(rippleTransaction);
        outgoingPayment._confirmPayment(fixturesRippleRestIntegration.requests.pending_payment)
          .error(function(payment){
            chai.assert(outgoingPayment.record.state, 'pending');
            done();
          });
      })
      .error(done);
  });

  it.skip('should successfully submit outgoing payments and must have transaction_hash and transaction_state', function(done){
    this.timeout(10000);
    var outgoingPayment;
    RippleTransactions
      .create(fixturesOutgoingPayment.requests.outgoing_record)
      .then(function(rippleTransaction){
        outgoingPayment = new OutgoingPayment(rippleTransaction);
        return outgoingPayment._sendPayment(fixturesRippleRestIntegration.requests.payment)
      })
      .then(function(pendingPayment){
        return outgoingPayment._confirmPayment(pendingPayment)
      })
      .then(function(payment){
        return outgoingPayment._recordAcceptanceOrRejectionStatus(payment)
      })
      .then(function(payment){
        chai.assert.strictEqual(payment.transaction_state, 'tesSUCCESS');
        chai.assert(payment.transaction_hash);
        done();
     })
    .error(done);
  });

  it.skip('should successfully submit outgoing payments with invoice and memos fields', function(done){
    this.timeout(10000);
    var outgoingPayment;
    RippleTransactions
      .create(fixturesOutgoingPayment.requests.outgoing_record_invoice_id_memos)
      .then(function(rippleTransaction){
        outgoingPayment = new OutgoingPayment(rippleTransaction);
        return outgoingPayment._sendPayment(fixturesRippleRestIntegration.requests.payment)
      })
      .then(function(pendingPayment){
        return outgoingPayment._confirmPayment(pendingPayment)
      })
      .then(function(confirmedPayment){
        chai.assert(confirmedPayment.memos);
        chai.assert.isArray(confirmedPayment.memos);
        chai.assert.equal(confirmedPayment.invoice_id, fixturesOutgoingPayment.requests.outgoing_record_invoice_id_memos.invoice_id);
        done();
      })
      .error(done);
  });

  it('should update the outgoing payment with the source balance changes', function(done) {

    var validatedPayment = fixturesRippleRestIntegration.successful_responses.validated_payment;

    validatedPayment.source_balance_changes = [
      { value: '-1.012', currency: 'XRP', issuer: '' },
      { value: '1',      currency: 'BTC', issuer: 'rJMtFJ7hKzvcGyzKp9rN9PrqNPReSsdFv5' },
      { value: '0.45',   currency: 'BTC', issuer: 'rwjYEBN9DSMnxLzGVEfbqmabDd2sr2kzcz' }
    ];

    validatedPayment.destination_balance_changes = [
      { value: '0.5', currency: 'XAU', issuer: 'rJMtFJ7hKzvcGyzKp9rN9PrqNPReSsdFv5' },
      { value: '0.2', currency: 'XAU', issuer: 'rwjYEBN9DSMnxLzGVEfbqmabDd2sr2kzcz' }
    ];

    RippleTransactions
      .create(fixturesOutgoingPayment.requests.outgoing_record_invoice_id_memos)
      .then(function(rippleTransaction){
        outgoingPayment = new OutgoingPayment(rippleTransaction);
        return outgoingPayment._recordAcceptanceOrRejectionStatus(validatedPayment)
      })
      .then(function(rippleTransaction) {
        chai.assert.strictEqual(rippleTransaction.to_currency, 'XAU');
        chai.assert.strictEqual(rippleTransaction.to_amount, 0.7);
        chai.assert.strictEqual(rippleTransaction.from_currency, 'BTC');
        chai.assert.strictEqual(rippleTransaction.from_amount, 1.45);
        done();
      })
      .error(done);
  });

  it('should update the outgoing payment with the source balance changes', function(done) {

    var validatedPayment = fixturesRippleRestIntegration.successful_responses.validated_payment;

    validatedPayment.source_balance_changes = [
      { value: '-1.012', currency: 'XRP', issuer: '' },
      { value: '1',      currency: 'BTC', issuer: 'rJMtFJ7hKzvcGyzKp9rN9PrqNPReSsdFv5' },
      { value: '0.45',   currency: 'BTC', issuer: 'rwjYEBN9DSMnxLzGVEfbqmabDd2sr2kzcz' }
    ];

    validatedPayment.destination_balance_changes = [
      { value: '0.5', currency: 'XAU', issuer: 'rJMtFJ7hKzvcGyzKp9rN9PrqNPReSsdFv5' },
      { value: '0.2', currency: 'XAU', issuer: 'rwjYEBN9DSMnxLzGVEfbqmabDd2sr2kzcz' }
    ];

    RippleTransactions
      .create(fixturesOutgoingPayment.requests.outgoing_record_invoice_id_memos)
      .then(function(rippleTransaction){
        outgoingPayment = new OutgoingPayment(rippleTransaction);
        return outgoingPayment._recordAcceptanceOrRejectionStatus(validatedPayment)
      })
      .then(function(rippleTransaction) {
        chai.assert.strictEqual(rippleTransaction.to_currency, 'XAU');
        chai.assert.strictEqual(rippleTransaction.to_amount, 0.7);
        chai.assert.strictEqual(rippleTransaction.from_currency, 'BTC');
        chai.assert.strictEqual(rippleTransaction.from_amount, 1.45);
        done();
      })
      .error(done);
  });

});
