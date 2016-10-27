'use strict';

exports = module.exports = body => {

  // Use npm 'marked' to parse markdown, licensed under MIT.
  // https://github.com/chjj/marked
  return require('marked')(body);

};
