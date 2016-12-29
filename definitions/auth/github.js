'use strict';

const Strategy = require('passport-github2');

// config definition hasn't loaded yet
exports.strategy = new Strategy({
  clientID: F.config['oauth.github.id'] || 'your-client-id',
  clientSecret: F.config['oauth.github.secret'] || 'your-client-secret',
  callbackURL: '/special/login/github/callback'
}, (accessToken, refreshToken, profile, done) => {
  if (profile.emails.length === 0)
    return done(new Error('Profile does not have any valid emails on record'));

  done(null, {
    id: profile.id,
    provider: 'github',
    name: profile.displayName,
    shortName: profile.displayName ? profile.displayName.substring(0, profile.displayName.indexOf(' ')) : undefined,
    username: profile.username,
    email: profile.emails[0].value
  });
});

// used to render the button on the login page
// if the icon begins with 'fa-', a FontAwesome icon will be used,
//    otherwise, the icon will be loaded via URL
exports.button = {
  text: 'GitHub',
  icon: 'fa-github',
  color: {
    background: '#333',
    foreground: '#f5f5f5'
  }
};

// passed directly to passport during initial authentication
exports.options = {
  scope: 'user.email'
};

// passed to passport during callback handling
exports.callback = {
  failureRedirect: '/special/login',
  successRedirect: '/'
};
