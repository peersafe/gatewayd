var activatedRippleAddressModel = require('../models/activated_ripple_addresses');

function configure(api) {

  api.create = function(opts, fn){
    var model = activatedRippleAddressModel.build(opts);
    var errors = model.validate();

    if (errors) {
      fn(errors, null);
      return;
    }

    model.save().complete(function(err, activated_ripple_address){
      if (err) {
        fn(err, null);
      } else {
        fn(null, activated_ripple_address);
      }
    }); 
  };

  api.read = function(opts, fn){
    activatedRippleAddressModel.find({ where: opts }).complete(function(err, activated_ripple_address){
      if(err){
        fn(err, null);
      } else if (activated_ripple_address) {
        fn(null, activated_ripple_address);
      } else {
        fn(null, null);
      } 
    });
  };

  api.update = function(opts, fn){
    activatedRippleAddressModel.find(opts.id).complete(function(err, activated_ripple_address){
      if (err){
        fn(err, null);
      } else if (activated_ripple_address) {
        delete opts.id;
        activated_ripple_address.updateAttributes(opts).complete(fn);
      } else {
        fn({ id: 'record not found' }, null);
      }
    });
  };

  api.delete = function(opts, fn){
    activatedRippleAddressModel.find(opts.id).complete(function(err, activated_ripple_address){
      var data = activated_ripple_address.toJSON();
      activated_ripple_address.destroy().complete(function(){
        fn(null, data);
      });
    });
  };
  
}

module.exports = configure;

