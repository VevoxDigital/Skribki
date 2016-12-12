'use strict';

const config = require('nconf');

const COOKIE = '__lang';

// fetch the locale from the session, default to English
F.onLocate = req => {
  req.lang = req.cookie(COOKIE) || config.get('language') || 'en';
  return req.lang;
};
