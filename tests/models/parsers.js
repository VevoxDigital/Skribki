'use strict';

const assert = require('assert'),
      expect = require('expect.js');

exports.run = () => {

  F.assert('model:parsers:escape', next => {
    F.model('parsers/escape').run('<i>foo</i>').then(res => {
      expect(res).to.be('&lt;i&gt;foo&lt;/i&gt;');
      next();
    }).catch(assert.isError).done();
  });

  F.assert('model:parsers:markdown', next => {
    F.model('parsers/markdown').run('*italic* **bold**').then(res => {
      expect(res.trim()).to.be('<p><em>italic</em> <strong>bold</strong></p>');
      next();
    }).catch(assert.isError).done();
  });

};
