exports.up = function(db, callback) {
  db.createTable('asset', { 
    PaymentHash: { type: 'string', notNull: true, unique: true },
    CurrencyName: { type: 'string', notNull: true, unique: true },
    CurrencySymbol: { type: 'string' },
    CurrencyOwner: { type: 'string' },
    CurrencyAmount: { type: 'int' },
    CurrencyStatus: {type: 'int'}
  }, callback);

};

exports.down = function(db, callback) {
  db.dropTable('asset', callback);
};
