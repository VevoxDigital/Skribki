'use strict'

const url = require('url')
const _ = require('lodash')

let middleware = { }

/**
  * @function middleware['public-files']
  * Redirects any requests to '/public/**' to the proper location on disk.
  */
middleware['public-files'] = (req, res, next) => {
  if (req.url.startsWith('/public')) {
    return res.redirect(req.url.substring(7))
  }
  next()
}

/**
  * @function middleware['route-normalizer']
  * Removed trailing slashes from urls to ensure normalization.
  */
middleware['route-normalizer'] = (req, res, next) => {
  if (req.method !== 'GET') return next()
  let u = url.parse(req.url)
  if (u.pathname.endsWith('/') && u.pathname.length > 1) {
    res.redirect(u.pathname.slice(0, -1) + (u.search || '') + (u.hash || ''), true)
  } else return next()
}

/**
  * @function middleware['route-logging']
  * Outputs logging information for various routing and user movement
  */
middleware['route-logging'] = (req, res, next, opts, controller) => {
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
}

// attach the middleware to a framework object
F.$routingMiddleware = middleware
_.each(middleware, (m, name) => {
  F.middleware(name, m)
  F.use(name)
})

// now, let's inject our 'viewError' method into the Controller prototype

/**
  * @method viewError
  * Renders the error view with the specified information
  *
  * @this Controller
  * @param code The code to send
  * @param url  <opt> The url that caused the error
  * @param info <opt> Any extra error info
  */
global.Controller.prototype.viewError = function (code, url, info) {
  this.repository.title = U.localize(this.req, 'error.header', code)
  this.status = code
  this.view('error', {
    errno: code,
    url: url,
    info: info
  })
}

// set up some aliases for 'viewError' with common error codes
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

// set up some 404 redirects for special urls
F.on('error404', (req, res, exception) => {
  if (req.url.startsWith('/special')) {
    res.redirect(req.url.substring(8))
  } else if (req.url.startsWith('/.')) {
    res.redirect('/' + req.url.substring(2))
  }
})
