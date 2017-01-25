'use strict';

F.middleware('public-files', (req, res, next) => {
  if (req.url.startsWith('/public'))
    return res.redirect(req.url.substring(7));
  next();
});
F.use('public-files');


F.middleware('route-logging', (req, res, next, opts, controller) => {
  res.on('finish', () => {

    let color = (() => {
      if (res.statusCode >= 500) color = 'red';
      else if (res.statusCode >= 400) color = 'yellow';
      else if (res.statusCode >= 300) color = 'cyan';
      else if (res.statusCode >= 200) color = 'green';
      else return 'white';
    })();

    let ctrlMessage = controller ? controller.name + '!' : '';

    LOG.log(Utils.locked(req.url) ? 'silly' : 'verbose',
      `${req.connection.remoteAddress} ${req.method.bold} ${ctrlMessage}${req.url} ${res.statusCode.toString()[color]}`);

  });
  next();
});
F.use('route-logging');

Controller.prototype.viewError = function (code, url = this.url, info) {
  this.repository.title = Utils.localize(this.req, 'error.header', [ code ]);
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
