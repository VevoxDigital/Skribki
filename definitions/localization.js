'use strict';

const fs    = require('fs'),
      path  = require('path'),
      _     = require('lodash');

const COOKIE = '__lang';

F.onLocale = (req, res) => {
  let lang = req.query.language;
  if (lang) {
    res.cookie(COOKIE, lang);
    req.language = lang;
    return lang;
  } else {
    req.language = req.cookie(COOKIE);
    return req.language;
  }
};

F.config.languages = { };
try {
  LOG.info('loading languages...');
  _.each(fs.readdirSync(F.path.resources()), file => {
    file = path.basename(file, '.resource');
    F.config.languages[file] = {
      id: file,
      name: Utils.localize(file, 'lang.name'),
      region: Utils.localize(file, 'lang.region')
    }
    LOG.info(` > loaded '${file}'`);
  });
} catch (e) {
  LOG.error('could not load language files');
  LOG.error(e.stack);
}
