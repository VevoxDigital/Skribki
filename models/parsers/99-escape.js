'use strict';

const q       = require('q'),
      cheerio = require('cheerio');

exports.id = 'parsers/escape';

exports.run = content => {
  let $ = cheerio.load(content);
  $('script').remove();
  return q($.html());
};
