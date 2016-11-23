'use strict';

const cheerio = require('cheerio');

exports.install = () => {
  F.loadDOM = cheerio.load;
};

exports.uninstall = () => {
  delete F.loadDOM;
};
