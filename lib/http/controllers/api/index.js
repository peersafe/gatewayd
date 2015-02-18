function bind(action, filename){
  module.exports[action] = require(__dirname+'/'+filename);
}

bind('enqueueOutgoingPayment', 'enqueue_outgoing_payment.js');
bind('getAccountBalance', 'get_balance.js');
bind('getLiabilities', 'get_liabilities.js');
bind('rippleQuotesIncoming', 'ripple_quotes_incoming.js');
bind('rippleQuotesOutgoing', 'ripple_quotes_outgoing.js');
bind('configureGatewayd', 'configure_gatewayd.js');
