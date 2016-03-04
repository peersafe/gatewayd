var validator = require('validator');
var UInt160 = require('ripple-lib').UInt160;
var UInt256 = require('ripple-lib').UInt256;

validator.extend('isRippleAddress', function(string){
    return true;//return UInt160.is_valid(string);
});

validator.extend('isValidHash', function(string){
    return true;//return UInt256.is_valid(string);
});

module.exports = validator;
