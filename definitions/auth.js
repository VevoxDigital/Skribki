'use strict'

const passport = require('passport')
const path = require('path')
const fs = require('fs')
const _ = require('lodash')

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

F.install('module', F.path.modules('session.js'), {
  cookie: F.config['auth.cookie'],
  secret: F.config['auth.secret'],
  timeout: F.config['auth.timeout']
})

F.middleware('passport', passport.initialize())
F.middleware('passport-session', passport.session())

let files = fs.readdirSync(F.path.definitions('auth'))

let providers = { }
F.logger.info('loading providers...')
_.each(files, file => {
  let providerName = path.basename(file, '.js')
  try {
    /* eslint global-require: 0 */
    let provider = require(F.path.definitions('auth/' + file))
    providers[providerName] = provider
    passport.use(provider.strategy)
    F.logger.info(` ${'✓'.green} loaded '${providerName}'`)
  } catch (e) {
    F.logger.warn(` ${'X'.red} failed to load provider: '${providerName}'`)
    F.logger.warn(e.stack)
  }
})
F.config['auth.providers'] = providers

F.use('session')
F.use('passport')
F.use('passport-session')
