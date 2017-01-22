'use strict';

const passport  = require('passport'),
      path      = require('path'),
      fs        = require('fs');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

INSTALL('module', F.path.modules('session.js'), {
  cookie: CONFIG('auth.cookie'),
  secret: CONFIG('auth.secret'),
  timeout: CONFIG('auth.timeout')
});

F.middleware('passport', passport.initialize());
F.middleware('passport-session', passport.session());

let files = fs.readdirSync(F.path.definitions('auth'));

let providers = { };
LOG.info('loading providers...')
_.each(files, file => {
  try {
    /* eslint global-require: 0 */
    let provider = require(F.path.definitions('auth/' + file));
    let providerName = path.basename(name, '.js');
    providers[providerName] = provider;
    passport.use(provider.strategy);
  } catch (e) {
    LOG.warning(' > failed to load provider: ' + providerName);
    LOG.warning(e.stack);
  }
});
F.config['auth.providers'] = providers;

F.use('session');
F.use('passport');
F.use('passport-session');
