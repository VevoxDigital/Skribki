'use strict';

const parser = require(require('path')
  .join(__dirname, '..', '..', '..', 'extensions', 'parsers', '90-markdown.js'));

exports.run = () => {

  F.assert('Parser: Markdown', (next, name) => {
    assert.ok(parser('*Italic* **Bold**') === '<p><em>Italic</em> <strong>Bold</strong></p>\n', name + ' - Bold & Italic');
    assert.ok(parser('# Header') === '<h1 id="header">Header</h1>\n', name + ' - Header');
    assert.ok(parser('#Header') === '<p>#Header</p>\n', name + ' - Header (Incorrect)');
    next();
  });

};
