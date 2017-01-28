'use strict';

const passport  = require('passport'),
      _         = require('lodash');

exports.install = () => {

  F.route('/special/login', viewLogin);
  F.route('/special/login/{provider}', processLogin);
  F.route('/special/login/{provider}/callback', processLoginCallback);
  F.route('/special/logout', processLogout);

};

/**
  * @function viewLogin
  * Views the login page
  *
  * @this FrameworkController
  */
function viewLogin() {
  let model = { error: this.query.err };
  _.each(CONFIG('auth.providers'), (provider, name) => {
    model[name] = provider.button;
  });
  this.view('login', model);
}

/**
  * @function checkProvider
  * Checks the given provider, throwing a 400 otherwise
  *
  * @this FrameworkController
  * @param name The name of the provider
  */
function checkProvider(name) {
  return !!(CONFIG('auth.providers') || EMPTYOBJECT)[name];
}

/**
  * @function processLogin
  * Starts the login attempt and begins delegation through passport
  *
  * @this FrameworkController
  * @param providerName The name of the provider
  */
function processLogin(providerName) {
  if (!checkProvider(providerName)) return this.throw400('Unknown provider: ' + providerName);

  let provider = CONFIG('auth.providers')[providerName];

  this.custom();
  passport.authenticate(providerName, provider.options || { })(this.req, this.res, NOOP);
}

/**
  * @function processLoginCallback
  * Handles the callback and actually logs the user
  *
  * @this FrameworkController
  * @param providerName The name of the provider
  */
function processLoginCallback(providerName) {
  if (!checkProvider(providerName)) return this.throw400('Unknown provider: ' + provider);

  let provider = CONFIG('auth.providers')[providerName];

  // add defaults to the provider's 'callback' property
  provider.callback = Utils.extend({ successRedirect: '/', failureRedirect: '/special/login' }, provider.callback, true);

  // try to actually authenticate the user now that they have gone through our provider
  passport.authenticate(providerName, (err, user, info) => {
    if (err) return this.redirect(provider.callback.failureRedirect + '?err=err.auth&msg=' + err.message);

    // check the email against the white/black-list
    if (utils.checkEmail(user.email))

      // email looks good, log in
      this.req.login(user, err => {
        if (err) return this.throw500(err);
        this.redirect(provider.callback.successRedirect);
      });

    else this.redirect(provider.callback.failureRedirect + '?err=auth.'
      + (CONFIG('auth.whitelist') ? 'whitelist' : 'blacklist'));

  })(this.req, this.res, err => {
    this.throw500(err);
  });
}

/**
  * @function processLogout
  * Logs the user out
  *
  * @this FrameworkController
  */
function processLogout() {
  this.req.logout();
  this.redirect(this.query.page || '/');
}
