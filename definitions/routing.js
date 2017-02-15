'use strict'

F.middleware('public-files', (req, res, next) => {
  if (req.url.startsWith('/public')) {
    return res.redirect(req.url.substring(7))
  }
  next()
})
F.use('public-files')

F.middleware('route-logging', (req, res, next, opts, controller) => {
  res.on('finish', () => {
    let color = (() => {
      if (res.statusCode >= 500) return 'red'
      else if (res.statusCode >= 400) return 'yellow'
      else if (res.statusCode >= 300) return 'cyan'
      else if (res.statusCode >= 200) return 'green'
      else return 'white'
    })()

    let ctrlMessage = controller ? controller.name + '!' : ''

    F.logger.log(U.locked(req.url) ? 'silly' : 'verbose',
      `${req.connection.remoteAddress} ${req.method.bold} ${res.statusCode.toString()[color]} ${ctrlMessage}${req.url}`)
  })
  next()
})
F.use('route-logging')

global.Controller.prototype.viewError = function (code, url, info) {
  this.repository.title = U.localize(this.req, 'error.header', code)
  this.status = code
  this.view('error', {
    errno: code,
    url: url,
    info: info
  })
}

let simpleCodes = [400, 401, 403, 404, 408, 418, 501]
for (const c of simpleCodes) {
  global.Controller.prototype['view' + c] = global.Controller.prototype['throw' + c] = function (msg) {
    this.viewError(c, this.url, msg)
  }
}

global.Controller.prototype.view500 = global.Controller.prototype.throw500 = function (err) {
  F.logger.warn(this.url + ' ' + err.stack)
  this.viewError(500, this.url, err.stack || err.toString())
}
global.Controller.prototype.view707 = global.Controller.prototype.view707 = function () {
  this.viewError(707, this.url, 'lol matt')
}

F.on('error404', (req, res, exception) => {
  if (req.url.startsWith('/special')) {
    res.redirect(req.url.substring(8))
  } else if (req.url.startsWith('/.')) {
    res.redirect('/' + req.url.substring(2))
  }
})
