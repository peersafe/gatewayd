var gateway = require(__dirname+'/../../../../');

module.exports = function(req, res) {
	var address = req.params.addr;
	gateway.data.activatedRippleAddress.read({ address: address }, function(err, activatedRippleAddress) {
    if (err) {
      res.send(500, { error: err });
      return;
    }
    
    if (activatedRippleAddress) {
    	if (!activatedRippleAddress.enabled) {
    		res.send(401, { result: -1 });
    	}
    	var addressOpts = {
        id: activatedRippleAddress.id,
        enabled: false,
        times: activatedRippleAddress.times + 1,
        total_amount: activatedRippleAddress.total_amount + 100
      };
    	gateway.data.activatedRippleAddress.update(addressOpts, function(err, model) {});
    	gateway.api.sendPayment(1, "XRP", address, function(err, response) {
	    	if (err) {
	    		addressOpts.enabled = true;
	    		addressOpts.total_amount = addressOpts.total_amount - 100;
	    		gateway.data.activatedRippleAddress.update(addressOpts, function(err, model) {});
		      res.send(401, { error: err });
		    } else {
		    	res.send({ result: 1 });
		    }
	    });
    } else {
    	var addressOpts = {
        address: address,
        enabled: false,
        total_amount: 100
      };
    	gateway.data.activatedRippleAddress.create(addressOpts, function(err, activatedRippleAddress) {
    		if (err) {
		      res.send(500, { error: err });
		      return;
		    }
		    gateway.api.sendPayment(1, "XRP", address, function(err, response) {
		    	if (err) {
		    		addressOpts.id = activatedRippleAddress.id;
		    		addressOpts.enabled = true;
		    		addressOpts.total_amount = 0;
	    		  gateway.data.activatedRippleAddress.update(addressOpts, function(err, model) {});
			      res.send(401, { error: err });
			    } else {
			    	res.send({ result: 1 });
			    }
		    });
		    
    	});
    }
  });

};
