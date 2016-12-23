'use strict';

const marked  = require('marked'),
      q       = require('q');

exports.id = 'parsers/markdown';

exports.run = content => {
  return q(marked(content));
};
