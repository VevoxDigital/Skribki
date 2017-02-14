'use strict'

const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const COOKIE = '__lang'

F.onLocale = (req, res) => {
  let lang = req.query.language
  if (lang) {
    res.cookie(COOKIE, lang)
    req.language = lang
    return lang
  } else {
    req.language = req.cookie(COOKIE)
    return req.language
  }
}

F.config.languages = { }
try {
  F.logger.info('loading languages...')
  _.each(fs.readdirSync(F.path.resources()), file => {
    file = path.basename(file, '.resource')
    F.config.languages[file] = {
      id: file,
      name: U.localize(file, 'lang.name'),
      region: U.localize(file, 'lang.region')
    }
    F.logger.info(` > loaded '${file}'`)
  })
} catch (e) {
  F.logger.error('could not load language files')
  F.logger.error(e.stack)
}
