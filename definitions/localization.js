'use strict';

const fs    = require('fs'),
      path  = require('path');

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

F.localize = (req, key, args = []) => {
  let localized = F.resource(req.language, key) || F.resource(F.config['wiki.lang'], key) || key;
  for (let i = 0; i < args.length; i++)
    localized = localized.replace(new RegExp('\\{' + i + '\\}', 'g'), args[i]);
  return localized;
};

F.config.languages = { };
let resources = fs.readdirSync(F.path.resources());
for (let res of resources) {
  res = path.basename(res, '.resource');
  F.config.languages[res] = {
    id: res,
    name: F.resource(res, 'lang.name') || res,
    region: F.resource(res, 'lang.region')
  };
}
