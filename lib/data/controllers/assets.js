var assetModel = require('../models/assets.js');

function configure(api) {

  api.create = function(opts, fn){
    var model = assetModel.build(opts);
    var errors = model.validate();

    if (errors) {
      fn(errors, null);
    } else {
      model.save().complete(function(err, assets){
        if (err) {
          fn(err, null);
        } else {
          fn(null,assets);
        }
      });
    }
  };

  api.read = function(opts, fn){
    assetModel.find({ where: opts }).complete(function(err, assets){
      if (err){
        fn(err, null);
      } else if (assets){
        fn(null, assets);
      } else {
        fn(null, null);
      }
    });
  };


  api.update = function(opts, fn){
    assetModel.find(opts.id).complete(function(err, assets){
      if (err){
        fn(err, null);
      } else if (assets) {
        delete opts.id;
        assets.updateAttributes(opts).complete(fn);
      } else {
        fn({ id: 'record not found' }, null);
      }
    });

  };

  api.delete = function(opts, fn){
    assetModel.find(opts.id).complete(function(err, assets){
      var data = assets.toJSON();
      external_account.destroy().complete(function(){
        fn(null, data);
      });
    });
  };

}

module.exports = configure;

