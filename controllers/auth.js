'use strict';

const passport  = require('passport'),
      config    = require('nconf');

// TODO Actually process all the providers with given options.

exports.install = () => {
  F.route('/special/login', function () { this.view('login'); }, ['#navbar']);
  F.route('/special/login/{provider}', process_login);
  F.route('/special/login/{provider}/callback', process_login_callback);
  F.route('/special/logout', process_logout);
};

function process_login(provider) {
  let self = this;

  self.custom();

  let strategy = config.get(`auth:strategies:${provider}`);
  if (!strategy) return self.res.send(404, 'Unknown provider: ' + provider);

  passport.authenticate(provider, strategy.options.auth)(self.req, self.res, () => { });
};

function process_login_callback(provider) {
  let self = this;

  let strategy = config.get(`auth:strategies:${provider}`);
  if (!strategy) return self.res.send(404, 'Unknown provider: ' + provider);

  strategy.options.callback = strategy.options.callback || { };
  strategy.options.callback.successRedirect = strategy.options.callback.successRedirect || '/';
  strategy.options.callback.failureRedirect = strategy.options.callback.failureRedirect || '/special/login';

  passport.authenticate(provider, (err, user, info) => {
    if (err) return self.redirect(strategy.options.callback.failureRedirect + '?err=err.auth.failure');

    const emails = config.get('auth:emails');
    let accept = !config.get('auth:whitelist');

    for (let i = 0; i < emails.length; i++) {
      let email = emails[i];
      if (email.startsWith('/')) {
        let flagIndex = email.lastIndexOf('/');
        if (!!user.email.match(new RegExp(email.substr(1, flagIndex), emails.substr(flagIndex + 1)))) {
          accept = !accept;
          break;
        }
      } else if (email === user.email) {
        accept = !accept;
        break;
      }
    }

    if (accept) {
      self.req.login(user, err => {
        if (err) return self.redirect(strategy.options.callback.failureRedirect
          + '?err=err.generic&msg=' + err.toString().replace(/\s/g, '+'));
        self.redirect(strategy.options.callback.successRedirect);
      });

    } else {
      let err = 'err.auth.' + (config.get('auth:whitelist') ? 'whitelist' : 'blacklist');
      self.redirect(strategy.options.callback.failureRedirect + '?err=' + err);
    }
  })(self.req, self.res, (err) => {
    if (err) F.response500(self.req, self.res, err);
  });
};

function process_logout() {
  let self = this;
  this.req.logout();
  delete self.session.user;
  this.redirect('/');
}
