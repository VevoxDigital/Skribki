'use strict';

const LOCKED = [
  /^\/special\//i, // Special pages/directores
  /^\/categor(?:y|ies)\//i,
  /^\/\./ // anything that starts with a dot
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

Controller.prototype.viewError = function (code, url = this.url, info) {
  this.repository.title = F.localize(this.req, 'error.header', [ code ]);
  this.view('error', {
    errno: code,
    url: url,
    info: info
  });
}

let simpleCodes = [400, 401, 403, 404, 408, 418, 501];
for (const c of simpleCodes)
  Controller.prototype['view' + c] = Controller.prototype['throw' + c] = function (msg) {
    this.viewError(c, this.url, msg);
  }
Controller.prototype.view500 = Controller.prototype.throw500 = function (err) {
  this.viewError(500, this.url, err.stack || err.toString());
};
Controller.prototype.view707 = Controller.prototype.view707 = function () {
  this.viewError(707, this.url, 'lol matt');
};

F.on('error404', (req, res, exception) => {
  if (req.url.startsWith('/special'))
    res.redirect(req.url.substring(8));
  else if (req.url.startsWith('/.'))
    res.redirect('/' + req.url.substring(2));
});
