var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.changeColumn('ripple_transactions', 'to_amount', {
    notNull: false
  }, function() {
    db.changeColumn('ripple_transactions', 'to_amount', {
      notNull: false
    }, callback);
  });
};

exports.down = function(db, callback) {
  db.changeColumn('ripple_transactions', 'to_amount', {
    notNull: true
  }, function() {
    db.changeColumn('ripple_transactions', 'to_amount', {
      notNull: true
    }, callback);
  });
};
