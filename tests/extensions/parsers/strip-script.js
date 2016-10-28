'use strict';

const parser = require(require('path')
  .join(__dirname, '..', '..', '..', 'extensions', 'parsers', '99-strip-script.js'));

exports.run = () => {

  F.assert('Parser: StripScript', (next, name) => {
    assert.ok(parser('<b>foo</b>') === '<b>foo</b>', name + ' - No Tag');
    assert.ok(parser('<b>foo</b><script>alert("foo")</script>') === '<b>foo</b>', name + ' - With Tag');
    next();
  });

};
