var gatewayd = require(__dirname+'/../../');
var assert = require('assert');

var RippleAddress = gatewayd.models.rippleAddresses;
var RippleTransaction = gatewayd.models.rippleTransactions;

var toAddress, fromAddress, rippleTransaction;

describe('ripple_associations', function() {

  it('ripple transaction should have one FromAddress', function(done) {

    rippleTransaction.getToAddress().then(function(address) {
      assert(address.id, toAddress.id);

      rippleTransaction.getFromAddress().then(function(address) {
        assert(address.id, fromAddress.id);

        done();
      });
    });

  });

  it('ripple address should have payments to it', function(done) {

    toAddress.getPaymentsTo({
      include: [
        { model: RippleAddress, as: 'ToAddress' },
        { model: RippleAddress, as: 'FromAddress' }
      ]
    }).then(function(payments) {
      assert.strictEqual(payments[0].to_currency, 'XAU');
      assert.strictEqual(payments[0].to_amount, 5);
      assert.strictEqual(payments[0].toAddress.id, toAddress.id);
      done();
    });
  });

  it('ripple payment should include the ripple addresses', function(done) {

    RippleTransaction.findAll({
      include: [
        { model: RippleAddress, as: 'ToAddress' },
        { model: RippleAddress, as: 'FromAddress' }
      ]
    })
    .then(function(transactions) {
      assert.strictEqual(transactions[0].toAddress.type, 'independent');
      assert.strictEqual(transactions[0].toAddress.address, 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk');
      done();
    });

  });

  before(function(done) {
		gatewayd.data.models.sync(function() {
      RippleAddress.create({
        managed: false,
        type: 'independent',
        address: 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk'
      })
      .then(function(address) {
        toAddress = address;
        return RippleAddress.create({
          managed: false,
          type: 'independent',
          address: 'ra9EVPRsiqncEfrRpJudDV34AqxFao8Zv9'
        })
        .then(function(address) {
          fromAddress = address;
          RippleTransaction.create({
            to_address_id: toAddress.id,
            from_address_id: fromAddress.id,
            to_amount: 5,
            to_currency: "XAU",
            to_issuer: 'ra9EVPRsiqncEfrRpJudDV34AqxFao8Zv9',
            from_amount: 5,
            from_currency: "XAU",
            from_issuer: 'ra9EVPRsiqncEfrRpJudDV34AqxFao8Zv9',
            direction: 'to-ripple',
            state: 'outgoing'
          })
          .then(function(transaction) {
            rippleTransaction = transaction;
            done();
          }).error(function(error) {
              done(error);
            })
        })
      })
    })
	});

  after(function(done) {
    toAddress.destroy()
      .then(function() {
        return fromAddress.destroy() 
      })
      .then(function() {
        rippleTransaction.destroy().then(done);
      });
  });
});

