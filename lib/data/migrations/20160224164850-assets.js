exports.up = function(db, callback) {
  db.createTable('assets', { 
    id:{type:'int',primaryKey:true,autoIncrement:true},
	code: { type: 'string', notNull: true, unique: true },
    name: { type: 'string'},
    symbol: { type: 'string' },
    owner: { type: 'string' },
    amount: { type: 'int' },
    status: {type: 'int'},
    hash: { type: 'string'},
    createdAt:{type:'datetime',notNull:true},
    updatedAt:{type:'datetime'}
  }, callback); 
};

exports.down = function(db, callback) {
  db.dropTable('assets', callback);
};
