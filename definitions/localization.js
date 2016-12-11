'use strict';

const COOKIE = '__lang';

// fetch the locale from the session, default to English
F.onLocate = req => {
  req.lang = req.cookie(COOKIE) || 'default';
  return req.lang;
};
