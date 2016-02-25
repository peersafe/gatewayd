exports.up = function(db, callback) {
  db.createTable('activated_ripple_addresses', { 
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    address: { type: 'string', notNull: true, unique: true },
    enabled: { type: 'boolean', default: false },
    times: { type: 'int', default: 1 },
    total_amount: { type: 'int', default: 100  },
    createdAt: { type: 'datetime', notNull: true },
    updatedAt: { type: 'datetime' }
  }, callback);

};

exports.down = function(db, callback) {
  db.dropTable('activated_ripple_addresses', callback);
};
