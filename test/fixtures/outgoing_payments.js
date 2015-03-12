module.exports = {
  requests: {
    valid: {
      amount: '0.01',
      currency: 'ZMK',
      address: 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk'
    },
    invalid_amount: {
      amount: '0.01a',
      currency: 'ZMK',
      address: 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk'
    },
    invalid_currency: {
      amount: '0.01',
      currency: '$ZMK',
      address: 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk'
    },
    invalid_address: {
      amount: '0.01',
      currency: 'ZMK',
      address: 'r421'
    },
    invalid_destination_tag: {
      amount: '0.01',
      currency: 'ZMK',
      address: 'r123',
      destinationTag: 'a123'
    },
    invalid_issuer_address: {
      amount: '0.01',
      currency: 'ZMK',
      address: 'r123',
      issuer: 'r123'
    },
    ripple_address: {
      id: 820,
      type: 'independent',
      managed: false,
      address: 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk',
      user_id: null,
      secret: null,
      tag: null,
      previous_transaction_hash: null,
      uid: null,
      data: null
    },
    outgoing_record: {
      to_amount: 0.0019399999999999999,
      from_amount: 0.002,
      to_address_id: 820,
      from_address_id: 623,
      to_currency: 'XRP',
      to_issuer: 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk',
      from_currency: 'GWD',
      from_issuer: 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk',
      state: 'outgoing',
      external_transaction_id: 169,
      direction: 'from-ripple'
    },
    outgoing_record_invoice_id_memos: {
      to_amount: 0.0019399999999999999,
      from_amount: 0.002,
      to_address_id: 1,
      from_address_id: 1,
      to_currency: 'XRP',
      to_issuer: 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk',
      from_currency: 'XRP',
      from_issuer: 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk',
      state: 'outgoing',
      external_transaction_id: 169,
      direction: 'from-ripple',
      invoice_id: '03AC674216F3E15C761EE1A5E255F067953623C8B388B4459E13F978D7C846F4',
      memos: [
        {
          MemoType: 'unformatted_memo',
          MemoData: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum是指一篇常用於排版設計領域的拉丁文文章，主要的目的為測試文章或文字在不同字型、版型下看起來的效果。Lorem ipsum es el texto que se usa habitualmente en diseño gráfico en demostraciones de tipografías o de borradores de diseño para probar el diseño visual antes de insertar el texto final.'
        }
      ]
    }
  },

  responses: {
    success: {
      prepared_payment: {
        "source_account": "rscJF4TWS2jBe43MvUomTtCcyrbtTRMSNr",
        "source_tag": "",
        "source_amount": {
          "value": "0.001939",
          "currency": "XRP",
          "issuer": ""
        },
        "source_slippage": "0",
        "destination_account": "r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk",
        "destination_tag": "",
        "destination_amount": {
          "value": "0.001939",
          "currency": "XRP",
          "issuer": ""
        },
        "invoice_id": "",
        "paths": "[]",
        "partial_payment": false,
        "no_direct_ripple": false
      }
    }
  }
};
