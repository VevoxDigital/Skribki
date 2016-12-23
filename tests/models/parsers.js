'use strict';

const assert = require('assert');

exports.run = () => {

  F.assert('models:parsers:escape', next => {
    F.model('parsers/escape').run('<i>foo</i>').then(res => {
      assert.equal(res, '&lt;i&gt;foo&lt;/i&gt;');
      next();
    }).catch(assert.isError).done();
  });

};
