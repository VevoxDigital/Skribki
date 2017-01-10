'use strict';

const passport = require('passport');

exports.install = () => {

  F.route('/special/login', viewLogin);
  F.route('/special/login/{provider}', processLogin);
  F.route('/special/login/{provider}/callback', processLoginCallback);
  F.route('/special/logout', processLogout);

};

exports.checkEmail = (email) => {
  const emails = F.config.auth.emails;

  for (const e of emails)
    if ((typeof e === 'object' && e instanceof RegExp && email.match(e))
      || e === email ) return true;

  return false;
};

function viewLogin() {
  let model = { };
  for (let providerName in F.config.auth.providers)
    if (F.config.auth.providers.hasOwnProperty(providerName))
      model[providerName] = F.config.auth.providers[providerName].button;

  this.view('login', model);
}

// initial login attempt
function processLogin(providerName) {
  this.custom();

  let provider = F.config.auth.providers[providerName];
  if (!provider) return this.response400('Unknown provider: ' + provider);

  passport.authenticate(providerName, provider.options || { })(this.req, this.res, () => { });
}

// process the callback
function processLoginCallback(providerName) {
  let provider = F.config.auth.providers[providerName];
  if (!provider) return this.throw400('Unknown provider: ' + provider);

  provider.callback = U.extend({ successRedirect: '/', failureRedirect: '/special/login' }, provider.callback, true);

  // try to actually authenticate the user now that they have gone through our provider
  passport.authenticate(providerName, (err, user, info) => {
    if (err) return this.redirect(provider.callback.failureRedirect + '?err=err.auth&msg=' + err.message);

    // check the email against the white/black-list
    if (F.config.auth.whitelist === exports.checkEmail(user.email))
      this.req.login(user, err => {
        if (err) return this.throw500(err);
        this.redirect(provider.callback.successRedirect);
      });
    else this.redirect(provider.callback.failureRedirect + '?err=auth.'
      + (F.config.auth.whitelist ? 'whitelist' : 'blacklist'));

  })(this.req, this.res, err => {
    this.throw500(err);
  });
}

function processLogout() {
  this.req.logout();
  this.redirect(this.query.page || '/');
}
