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

Controller.prototype.viewError = function (code, url) {
  this.repository.title = F.localize(this.req, 'error.header', [ code ]);
  this.view('error', {
    errno: code,
    url: url || this.url
  });
}
