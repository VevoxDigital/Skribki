'use strict';

const COOKIE = '__lang';

// fetch the locale from the session, default to English
F.onLocate = req => {
  req.lang = req.cookie(COOKIE) || 'en';
  return req.lang;
};
