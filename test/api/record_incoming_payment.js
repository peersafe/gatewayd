const gatewayd = require(__dirname+'/../../');
const walletsFixture = require(__dirname+'/../fixtures/wallets.js');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var Promise = require('bluebird');
var RippleTransaction = gatewayd.models.rippleTransactions;
var RippleAddress = gatewayd.models.rippleAddresses;
var sinon = require('sinon');

describe('record_incoming_payments', function() {

  chai.use(chaiAsPromised);

  before(function() {
    var configStub = sinon.stub(gatewayd.config, 'get');
    configStub.withArgs('HOT_WALLET').returns(walletsFixture.HOT_WALLET);
    configStub.withArgs('COLD_WALLET').returns(walletsFixture.COLD_WALLET);
  });

  beforeEach(function (done) {
    gatewayd.database.sync({force: true}).success(function () {
      done();
    });
  });

  it('should successfully persist a ripple_transaction for an incoming payment', function(done) {
    var address = walletsFixture.COLD_WALLET;
    return gatewayd.api.recordIncomingPayment({
      destination_tag: 123,
      destination_amount: {
        value: 5,
        currency: 'USD',
        issuer: 'r123'
      },
      source_account: address,
      source_amount: {
        value: 6,
        currency: 'EUR',
        issuer: address
      },
      transaction_state: 'tesSUCCESS',
      state: 'incoming',
      transaction_hash: '45154213',
      memos: [{ MemoData: '7274312E302E3132', MemoType: '636C69656E74' }]
    }).then(function(rippleTransaction) {
      chai.assert.strictEqual(rippleTransaction.to_amount, 5);
      chai.assert.strictEqual(rippleTransaction.to_currency, 'USD');
      chai.assert.strictEqual(rippleTransaction.to_issuer, gatewayd.config.get('COLD_WALLET'));
      chai.assert.strictEqual(rippleTransaction.from_amount, 6);
      chai.assert.strictEqual(rippleTransaction.from_currency, 'EUR');
      chai.assert.strictEqual(rippleTransaction.from_issuer, address);
      chai.assert.strictEqual(rippleTransaction.transaction_state, 'tesSUCCESS');
      chai.assert.deepEqual(rippleTransaction.memos, [{ MemoData: '7274312E302E3132', MemoType: '636C69656E74' }]);
      done();
    }).catch(function(error) {
      done(new Error(JSON.stringify(error)));
    })
  });

  it('should successfully persist a ripple_address for the destination for an incoming payment', function(done) {
    var address = walletsFixture.COLD_WALLET;
    gatewayd.api.recordIncomingPayment({
      destination_tag: 123,
      destination_amount: {
        value: 5,
        currency: 'USD',
        issuer: 'r123'
      },
      source_account: address,
      source_amount: {
        value: 6,
        currency: 'EUR',
        issuer: address
      },
      transaction_state: 'tesSUCCESS',
      state: 'incoming',
      transaction_hash: '45154213',
      memos: [{ MemoData: '7274312E302E3132', MemoType: '636C69656E74' }]
    }).then(function(rippleTransaction) {
      RippleAddress.find({
        where: {id: rippleTransaction.from_address_id}
      }).then(function(rippleAddress) {
        chai.assert.strictEqual(rippleAddress.address, address);
        chai.assert.isNull(rippleAddress.tag);
        chai.assert.isFalse(rippleAddress.managed);
        chai.assert.strictEqual(rippleAddress.type, 'independent');
        done();
      }).catch(function(error) {
        done(new Error(JSON.stringify(error)));
      })
    }).catch(function(error) {
      done(new Error(JSON.stringify(error)));
    })
  });

  it('should successfully persist a ripple_address for the source for an incoming payment', function(done) {
    var address = walletsFixture.COLD_WALLET;
    gatewayd.api.recordIncomingPayment({
      destination_tag: 123,
      destination_amount: {
        value: 5,
        currency: 'USD',
        issuer: 'r123'
      },
      source_account: address,
      source_amount: {
        value: 6,
        currency: 'EUR',
        issuer: address
      },
      transaction_state: 'tesSUCCESS',
      state: 'incoming',
      transaction_hash: '45154213',
      memos: [{ MemoData: '7274312E302E3132', MemoType: '636C69656E74' }]
    }).then(function(rippleTransaction) {
      RippleAddress.find({
        where: {id: rippleTransaction.to_address_id}
      }).then(function(rippleAddress) {
        chai.assert.strictEqual(rippleAddress.tag, 123);
        chai.assert.strictEqual(rippleAddress.address, gatewayd.config.get('COLD_WALLET'));
        chai.assert(rippleAddress.managed);
        chai.assert.strictEqual(rippleAddress.type, 'hosted');
        done();
      }).catch(function(error) {
        done(new Error(JSON.stringify(error)));
      })
    }).catch(function(error) {
      gatewayd.logger.error(error);
      done(new Error(JSON.stringify(error)));
    })
  });

  it('should fail when destination_tag is not a valid int', function() {
    var address = walletsFixture.COLD_WALLET;
    return chai.assert.isRejected(gatewayd.api.recordIncomingPayment({
      destination_tag: 'a123',
      destination_amount: {
        value: 5,
        currency: 'USD',
        issuer: 'r123'
      },
      source_account: address,
      source_amount: {
        value: 6,
        currency: 'EUR',
        issuer: address
      },
      transaction_state: 'tesSUCCESS',
      state: 'incoming',
      transaction_hash: '45154213',
      memos: [{ MemoData: '7274312E302E3132', MemoType: '636C69656E74' }]
    }), /Failed to create ripple_transaction record/);
  });

  it('should fail when destination_amount.value is missing is not a valid int', function() {
    var address = walletsFixture.COLD_WALLET;
    return chai.assert.isRejected(gatewayd.api.recordIncomingPayment({
      destination_tag: 123,
      destination_amount: {
        currency: 'USD',
        issuer: 'r123'
      },
      source_amount: {
        value: 6,
        currency: 'EUR',
        issuer: address
      },
      transaction_state: 'tesSUCCESS',
      state: 'incoming',
      transaction_hash: '45154213',
      memos: [{ MemoData: '7274312E302E3132', MemoType: '636C69656E74' }]
    }), /Failed to create ripple_transaction record/);
  });

  after(function() {
    gatewayd.config.get.restore();
  })
});
