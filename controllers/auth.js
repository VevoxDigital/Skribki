'use strict';

const passport  = require('passport'),
      config    = require('nconf');

// TODO Actually process all the providers with given options.

exports.install = () => {
  F.route('/special/login', function () { this.view('login'); }, ['#navbar', '#banner']);
  F.route('/special/login/{provider}', process_login, ['#navbar', '#passport.js', '#session']);
  F.route('/special/login/{provider}/callback', process_login_callback, ['#navbar', '#passport.js', '#session']);
};

function process_login(provider) {
  let self = this;

  self.custom();

  let strategy = config.get(`auth:strageties:${provider}`);
  if (!strategy) return self.res.status(404).send('Unknown provider: ' + provider);

  passport.authenticate(provider, strategy.options.auth || { })(self.req, self.res, () => {
    console.log('auth ok');
    // TODO Figure out when and why this calls.
  });
};

function process_login_callback(provider) {
  let self = this;

  let strategy = config.get(`auth:strageties:${provider}`);
  if (!strategy) return self.res.status(404).send('Unknown provider: ' + provider);

  strategy.options.callback = strategy.options.callback || { };
  strategy.options.callback.failureRedirect = strategy.options.callback.failureRedirect || '/special/login';

  passport.authenticate(provider, strategy.options.callback)(self.req, self.res, (err) => {
    if (err) return self.redirect(strategy.options.callback.failureRedirect + '?msg=' + err.toString().replace(' ', '+'));

    const emails = config.get('auth:emails');
    let accept = !config.get('auth:whitelist');

    for (let i = 0; i < emails.length; i++) {
      let email = emails[i];
      if (email.startsWith('/')) {
        let flagIndex = email.lastIndexOf('/');
        if (!!self.user.email.match(new RegExp(email.substr(1, flagIndex), emails.substr(flagIndex + 1)))) {
          accept = !accept;
          break;
        }
      } else if (email === self.user.email) {
        accept = !accept;
        break;
      }
    }

    self.redirect(accept ? '/' : strategy.options.callback.failureRedirect + '?msg=Email+blacklisted+or+not+whitelisted');
  });
};
