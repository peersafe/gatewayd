var ExternalTransaction = require(__dirname+'/../../../../lib/data').models.externalTransactions;
var ExternalAccount = require(__dirname+'/../../../../lib/data').models.externalAccounts;
var PaginationUtil = require(__dirname + '/../../../../lib/data/pagination_util.js');

function index(req, res){
  var query = PaginationUtil.buildModelPagination(req.query);
  query.include = [
    { model: ExternalAccount, as: 'ToAccount'},
    { model: ExternalAccount, as: 'FromAccount'}
  ];
  ExternalTransaction.findAll(query)
    .complete(function(err, externalTransactions){
      if (err) {
        res.send(500, {
          success: false,
          error: err
        });
      } else {
        res.send({
          success: true,
          external_transactions: externalTransactions
        });
      }
    });
}

function show(req, res){
  ExternalTransaction.find({
    where: { id: req.params.id },
    include: [
      { model: ExternalAccount, as: 'ToAccount'},
      { model: ExternalAccount, as: 'FromAccount'}
    ]
  }).complete(function(err, transaction){
    if (err){
      res.send(500, {
        success: false,
        error: err
      });
    } else if (transaction) {
      res.send({
        success: true,
        external_transaction: transaction
      });
    } else {
      res.send(204);
    }
  });
}

function update(request, response) {
  ExternalTransaction.find({
    where  : { id: request.params.id},
    include: [
      { model: ExternalAccount, as: 'ToAccount'},
      { model: ExternalAccount, as: 'FromAccount'}
    ]
  })
    .then(function(externalTransaction) {
      if (externalTransaction) {
        return externalTransaction.updateAttributes(request.body)
          .then(function(externalTransaction) {
            response
              .status(200)
              .send({
                success: true,
                externalTransaction: externalTransaction
              });
          });
      } else {
        response
          .status(404)
          .send({
            success: false,
            error: 'externalTransaction not found'
          });
      }
    })
    .error(function(error) {
      response
        .status(500)
        .send({
          success: false,
          error: error
        });
    });
}

function destroy(request, response) {
  ExternalTransaction.find(request.params.id)
    .then(function(externalTransaction) {
      if (externalTransaction) {
        return externalTransaction.destroy()
          .then(function() {
            response
              .status(200)
              .send({
                success: true
              });
          });
      } else {
        response
          .status(404)
          .send({
            success: false,
            error: 'externalTransaction not found'
          });
      }
    })
    .error(function(error) {
      response
        .status(500)
        .send({
          success: false,
          error: error
        });
    });
}

function create(request, response) {
  ExternalTransaction.create(request.body)
    .then(function(externalTransaction){
      response
        .status(201)
        .send({
          success: true,
          externalTransaction: externalTransaction
        });
    })
    .error(function(error) {
      response
        .status(500)
        .send({
          success: false,
          error: error
        });
    });
}

module.exports = {
  index: index,
  show: show,
  create: create,
  update: update,
  destroy: destroy
};
