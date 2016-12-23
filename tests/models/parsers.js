'use strict';

const assert = require('assert');

exports.run = () => {

  F.assert('models:parsers:escape', next => {
    F.model('parsers/escape').run('<i>foo</i>').then(res => {
      assert.equal(res, '&lt;i&gt;foo&lt;/i&gt;', 'should strip HTML tags');
      next();
    }).catch(assert.isError).done();
  });

  F.assert('models:parsers:markdown', next => {
    F.model('parsers/markdown').run('*italic* **bold**').then(res => {
      assert.equal(res.trim(), '<p><em>italic</em> <strong>bold</strong></p>', 'should parse markdown');
      next();
    }).catch(assert.isError).done();
  });

};
