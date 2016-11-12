'use strict';
const GitHubStrategy = require('passport-github2');

const secrets = require('../../lib/secrets');

exports = module.exports = (options) => {
  require('passport').use(new GitHubStrategy({
    clientID: options.clientID,
    clientSecret: options.clientSecret,
    callbackURL: '/special/login/github/callback'
  }, (accessToken, refreshToken, profile, done) => {
    done(null, profile);
  }));
}
