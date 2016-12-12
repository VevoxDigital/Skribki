'use strict';

const config  = require('nconf'),
      fs      = require('fs-extra'),
      path    = require('path');

const COOKIE = '__lang';

// fetch the locale from the session, default to English
F.defaultLocale = config.get('language') || 'en';
F.onLocate = req => { // onLocate? Is this a typo...?
  req.lang = req.cookie(COOKIE) || F.defaultLocale;
  return req.lang;
};

fs.readdir(path.join(__dirname, '..', 'resources'), (err, files) => {
  if (err) throw err;
  F.global.languages = [];
  files.forEach((file) => {
    let id = path.basename(file, '.resource');
    F.global.languages.push({
      id: id,
      name: F.translate(id, '#lang.name')
    });
  });
});

F.route('/special/lang', function () {
  this.res.cookie(COOKIE, this.req.query.l || F.defaultLocale, '2 days');
  this.redirect(this.req.query.url || '/');
});
