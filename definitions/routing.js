'use strict';

const LOCKED = [
  /^\/special\//i, // Special pages/directores
  /^\/categor(?:y|ies)\//i
];

F.lockedPatterns = LOCKED;
F.locked = rt => {
  if (typeof rt !== 'string') return true;
  for (const pat of LOCKED)
    if (rt.match(pat)) return true;
  return false;
};

F.middleware('public-files', (req, res, next) => {
  if (req.url.startsWith('/public'))
    return res.redirect(req.url.substring(7));
  next();
});
F.use('public-files');
