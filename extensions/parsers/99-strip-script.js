'use strict';

exports = module.exports = body => {

  // Strip out script tags, using npm 'cheerio'
  // https://github.com/cheeriojs/cheerio
  let $ = require('cheerio').load(body);
  $('script').remove();
  return $.html();

};
