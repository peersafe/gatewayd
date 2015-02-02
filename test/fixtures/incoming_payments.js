module.exports.incoming_payments = {
  valid: { source_account: 'rscJF4TWS2jBe43MvUomTtCcyrbtTRMSNr',
    source_tag: '',
    source_amount:
    { currency: 'SWD',
      issuer: 'rscJF4TWS2jBe43MvUomTtCcyrbtTRMSNr',
      value: '0.00101' },
    source_slippage: '0',
    destination_account: 'rMinhWxZz4jeHoJGyddtmwg6dWhyqQKtJz',
    destination_tag: '',
    destination_amount:
    { currency: 'SWD',
      issuer: 'rMinhWxZz4jeHoJGyddtmwg6dWhyqQKtJz',
      value: '0.001' },
    invoice_id: '',
    paths: '[[{"account":"rPtzajzE295BsGecxqNdUxtfrEiH2VGUVA","type":1,"type_hex":"0000000000000001"}]]',
    no_direct_ripple: false,
    partial_payment: false,
    direction: 'incoming',
    state: 'validated',
    result: 'tesSUCCESS',
    ledger: '10326017',
    hash: 'B664743F640F0F2E79BC9C9887C6A569844EB91B5D9B4F17E5E9570AB78F8F53',
    timestamp: '2014-12-05T01:05:40.000Z',
    fee: '0.012',
    source_balance_changes:
      [ { value: '-0.012', currency: 'XRP', issuer: '' },
        { value: '-0.001',
          currency: 'SWD',
          issuer: 'rMinhWxZz4jeHoJGyddtmwg6dWhyqQKtJz' } ],
    destination_balance_changes:
      [ { value: '0.001',
        currency: 'SWD',
        issuer: 'rMinhWxZz4jeHoJGyddtmwg6dWhyqQKtJz' } ],
    memos: [ { MemoData: '7274312E312E33', MemoType: '636C69656E74' } ]
  },
  makeArrayOfPayments: function() {
    var payment               = {};
    var incomingPayments      = {};
    payment.payment           = this.valid;
    payment.hash              = 'B664743F640F0F2E79BC9C9887C6A569844EB91B5D9B4F17E5E9570AB78F8F53';
    incomingPayments.payments = [];
    incomingPayments.payments.push(payment);
    return incomingPayments;
  },
  to_record: {
    state: 'incoming',
    source_amount: { value: '-0.012', currency: 'XRP', issuer: '' },
    destination_amount:
    { value: '0.001',
      currency: 'SWD',
      issuer: 'rMinhWxZz4jeHoJGyddtmwg6dWhyqQKtJz' },
    destination_tag: undefined,
    transaction_state: 'tesSUCCESS',
    hash: 'B664743F640F0F2E79BC9C9887C6A569844EB91B5D9B4F17E5E9570AB78F8F53',
    source_account: 'rscJF4TWS2jBe43MvUomTtCcyrbtTRMSNr',
    invoice_id: '',
    memos: [ { MemoData: '7274312E312E33', MemoType: '636C69656E74' } ]
  },
  notification: {
    Account: 'rscJF4TWS2jBe43MvUomTtCcyrbtTRMSNr',
    Amount:
    { currency: 'SWD',
      issuer: 'rMinhWxZz4jeHoJGyddtmwg6dWhyqQKtJz',
      value: '0.01' },
    Destination: 'rMinhWxZz4jeHoJGyddtmwg6dWhyqQKtJz',
    Fee: '12000',
    Flags: 0,
    LastLedgerSequence: 10481724,
    Memos: [ { Memo: [Object] } ],
    Paths: [ [ [Object] ] ],
    SendMax:
    { currency: 'SWD',
      issuer: 'rscJF4TWS2jBe43MvUomTtCcyrbtTRMSNr',
      value: '0.0101' },
    Sequence: 1110,
    SigningPubKey: '020721DDADB796BC176335ED9203CE1CFC7C3D162E9C2A379F6953E2909569DE14',
    TransactionType: 'Payment',
    TxnSignature: '304502210097663BFC023DEB18A2537908A785D390A741BB353EEB77DBF56DC90F9289C52B022078F023E8E2D0A69C88BE028BFAFCF373F17E2A64F3504DED4CFB7F66C7B4B807',
    date: 471742480,
    hash: 'B664743F640F0F2E79BC9C9887C6A569844EB91B5D9B4F17E5E9570AB78F8F53',
    inLedger: 10481721,
    ledger_index: 10481721,
    meta:
    { AffectedNodes: [ [Object], [Object], [Object] ],
      TransactionIndex: 7,
      TransactionResult: 'tesSUCCESS' },
    validated: true
  },
  recorded_payment: {
    dataValues: {
      to_address_id    : 1,
      to_amount        : '0.001',
      to_currency      : 'SWD',
      to_issuer        : 'rMinhWxZz4jeHoJGyddtmwg6dWhyqQKtJz',
      from_address_id  : 2,
      from_amount      : '-0.012',
      from_currency    : 'XRP',
      from_issuer      : undefined,
      transaction_state: 'tesSUCCESS',
      state            : 'incoming',
      transaction_hash : 'B664743F640F0F2E79BC9C9887C6A569844EB91B5D9B4F17E5E9570AB78F8F53',
      memos            : '[{"MemoData":"7274312E312E33","MemoType":"636C69656E74"}]',
      direction        : 'from-ripple',
      updatedAt        : 'Fri Dec 12 2014 17:44:31 GMT-0800 (PST)',
      createdAt        : 'Fri Dec 12 2014 17:44:31 GMT-0800 (PST)',
      id               : 1
    }
  }
};
