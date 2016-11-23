'use strict';

const passport  = require('passport'),
      fs        = require('fs-extra'),
      config    = require('nconf'),
      path      = require('path');

const secrets = require('../lib/secrets');

INSTALL('module', path.join(__dirname, '..', 'lib', 'session.js'),
  { cookie: '_skr-ss', secret: CONFIG('secret'), timeout: '1 hour' });

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

var files = [];
const auths = fs.walk('./definitions/auth')
  .on('data', item => {
    if (!item.stats.isDirectory()) files.push({
      func: require(item.path),
      name: path.basename(item.path, '.js')
    });
  }).on('end', () => {
    files.forEach(file => {
      let opts = config.get(`auth:strageties:${file.name}:options:init`) || { },
          secret = secrets.fetch(file.name) || { }; // Not everything needs a secret
      opts.clientID = secret.id;
      opts.clientSecret = secret.secret;
      file.func(opts);
    });

    F.middleware('passport.js', passport.initialize());
    F.middleware('passport.js-session', passport.session());
    F.middleware('user', (req, res, next, options, controller) => {
      if (controller && controller.user) {
        controller.user.shortName = controller.user.name
          ? controller.user.name.substring(0, controller.user.name.indexOf(' '))
          : user.username;
      }
      next();
    });

    F.use('session');
    F.use('passport.js');
    F.use('passport.js-session');
    F.use('user');
  });
