var Promise = require('bluebird');
var config = require(__dirname+'/../../config/environment.js');
var RippleAddresses = require(__dirname+'/../data/').models.rippleAddresses;

/**@requires config, rippleAddresses
 * @function getHostedAddress
 *
 * @description Returns the promise from a RippleAddresses findOrCreate using the gatewayd cold_wallet, provided tag,
 * type: 'hosted' and managed: true
 *
 * @param tag
 */
function getHostedAddress(tag) {
  return new Promise(function(resolve, reject) {
    RippleAddresses.findOrCreate({
      address: config.get('COLD_WALLET'),
      tag: tag,
      type: 'hosted',
      managed: true
    }).then(resolve)
      .error(function(error) {
        logger.error('[get_hosted_address.js:getHostedAddress] Failed to create hosted address with tag [%j], ERROR: ', tag, error);
        return reject(new Error('Failed find or create hosted address'));
      });
  });
}

module.exports = getHostedAddress;

