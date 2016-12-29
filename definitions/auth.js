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

F.config.auth = F.config.auth || { };
INSTALL('module', F.path.modules('session.js'), {
  cookie: F.config.auth.cookie,
  secret: F.config.auth.secret,
  timeout: F.config.auth.timeout
});

F.middleware('passport', passport.initialize());
F.middleware('passport-session', passport.session());

let files = fs.readdirSync(F.path.definitions('auth'));
F.config.auth.providers = { };
for (const name of files) {
  let provider = require('./auth/' + name);
  F.config.auth.providers[path.basename(name, '.js')] = provider;
  passport.use(provider.strategy);
}

F.use('session');
F.use('passport');
F.use('passport-session');
