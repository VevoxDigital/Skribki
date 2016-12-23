'use strict';

const q = require('q');

exports.id = 'parsers/escape';

exports.run = content => {
  content = content.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
  return q(content);
};
