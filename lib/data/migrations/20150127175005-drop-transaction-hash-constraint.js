var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.all('ALTER TABLE ripple_transactions DROP CONSTRAINT ripple_transactions_transaction_hash_key CASCADE', callback);
};