'use strict';
const GitHubStrategy = require('passport-github2');

const secrets = require('../../lib/secrets');

exports = module.exports = (options) => {
  require('passport').use(new GitHubStrategy({
    clientID: options.clientID,
    clientSecret: options.clientSecret,
    callbackURL: '/special/login/github/callback'
  }, (accessToken, refreshToken, profile, done) => {
    if (profile.emails.length === 0)
      return done(new Error('Profile does not have any valid emails on record'));
    done(null, {
      id: profile.id,
      provider: profile.provider,
      name: profile.displayName || profile.username,
      username: profile.username,
      email: profile.emails[0].value
    });
  }));
}
