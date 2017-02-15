'use strict'

const CACHE_PREFIX = 'style'

const sass = require('node-sass')
const fs = require('fs')
const path = require('path')

/**
  * Compiles the given content into CSS, with the give dir and `node_modules` as includePaths
  * @param content The content to compile
  * @param dir     The directory for includePaths
  */
exports.compile = (content, dir) => {
  if (content === '') return ''
  try {
    return sass.renderSync({
      data: content,
      outputStyle: 'compressed',
      includePaths: [ dir, F.path.public('styles'), F.path.root('node_modules') ]
    }).css.toString()
  } catch (e) {
    F.logger.error('style engine failure')
    F.logger.error(e.stack)
    throw e
  }
}

/**
  * Install a file router for `/styles/*` and set up the configs
  * @this Framework
  */
exports.install = () => {
  F.path.themes = p => F.path.root('themes/' + p)

  F.file('/styles/*', compileTarget)
  F.config['static-accepts']['.scss'] = true

  F.onCompileCSS = (filename, content) => {
    return exports.compile(content)
  }
}

/**
  * Compiles the given target into CSS.
  * @param req          The target request
  * @param res          The target response
  * @param isValidation If truthy, simply returns a boolean if the route is valid.
  * @this Framework
  */
function compileTarget (req, res, isValidation) {
  if (isValidation) return req.url.endsWith('.scss') || req.url.endsWith('.sass')
  else if (!compileTarget(req, res, true)) return false

  // try to load from cache if present.
  let key = CACHE_PREFIX + '_' + req.url.substring(1).slice(0, -5)
  let cached = F.cache.get(key)
  if (cached) return send(req, res, key, cached)

  let route = req.url.substring('/styles/'.length)

  if (route.startsWith('theme')) compileTargetTheme(req, res, key, route)
  else sendFile(req, res, key, F.path.public(req.url))
}

/**
  * Compiles the given target into themed CSS
  * @param req   The request
  * @param res   The response
  * @param key   The cache key
  * @param route The route, themed.
  */
function compileTargetTheme (req, res, key, route) {
  let theme = F.config['wiki.theme'] || F.config['default-theme']
  F.logger.debug('theme theme=' + theme)

  sendFile(req, res, key, F.path.themes(theme + route.substring('theme'.length)))
}

/**
  * Sends the given file as CSS
  * @param req  The request
  * @param res  The response
  * @param key  The cache key
  * @param file The file to send
  */
function sendFile (req, res, key, file) {
  fs.readFile(file, (err, data) => {
    if (err) {
      return err.message.startsWith('ENOENT')
        ? F.response404(req, res)
        : F.response500(req, res, err)
    }

    try {
      if (!F.isDebug) F.logger.info('compiling uncached style ' + key)
      send(req, res, key, exports.compile(data.toString(), path.dirname(file)))
    } catch (e) {
      F.response500(req, res, e)
    }
  })
}

/**
  * Sends the given data as CSS with a 200 into the output
  * @param req  The request
  * @param res  The response
  * @param key  The cache key.
  * @param data The data to send.
  */
function send (req, res, key, data) {
  if (!F.isDebug) F.cache.set(key, data, '10 minutes')
  F.responseContent(req, res, 200, data, 'text/css')
  F.stats.response.file++
}
