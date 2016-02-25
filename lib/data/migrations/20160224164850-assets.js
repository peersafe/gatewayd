exports.up = function(db, callback) {
  db.createTable('assets', { 
		CurrencyCode: { type: 'string', notNull: true, unique: true },
    CurrencyName: { type: 'string'},
    CurrencySymbol: { type: 'string' },
    CurrencyOwner: { type: 'string' },
    CurrencyAmount: { type: 'int' },
    CurrencyStatus: {type: 'int'},
    PaymentHash: { type: 'string'},
  }, callback);

};

exports.down = function(db, callback) {
  db.dropTable('assets', callback);
};
