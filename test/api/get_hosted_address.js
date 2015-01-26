const gatewayd = require(__dirname+'/../../');
const walletsFixture = require(__dirname+'/../fixtures/wallets.js');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var RippleAddress = gatewayd.models.rippleAddresses;
var sinon = require('sinon');

describe('get_hosted_address ', function() {

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

  it('should successfully persist a ripple_address record associated with the cold_wallet of the gateway given a tag', function(done) {
    gatewayd.api.getHostedAddress(1234)
      .then(function(hostedAddress) {
        chai.assert.strictEqual(hostedAddress.address, gatewayd.config.get('COLD_WALLET'));
        chai.assert.strictEqual(hostedAddress.tag, 1234);
        chai.assert.strictEqual(hostedAddress.type, 'hosted');
        chai.assert.strictEqual(hostedAddress.managed, true);
        done();
      }).error(function(error) {
        done(new Error(JSON.stringify(error)));
      })
  });

  it('should fail to persist a ripple_address record because \'tag\' field is not an int', function() {
    return chai.assert.isRejected(gatewayd.api.getHostedAddress('ab123'), /Failed find or create hosted address/);
  });

  after(function() {
    gatewayd.config.get.restore();
  })

});
