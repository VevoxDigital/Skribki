'use strict';

const passport  = require('passport'),
      fs        = require('fs-extra'),
      config    = require('nconf'),
      path      = require('path');

const secrets = require('../lib/secrets');

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
  });
