'use strict';

const passport  = require('passport'),
      config    = require('nconf');

exports.install = () => {
  F.route('/special/login', viewLogin, ['#navbar']);
  F.route('/special/login/{provider}', processLogin);
  F.route('/special/login/{provider}/callback', processLoginCallback);
  F.route('/special/logout', processLogout);
};

// simply view the login page if no provider is given.
function viewLogin() {
  let self = this;

  // init model and load strategies from config.
  let model = { strategies: [] },
      strategies = config.get('auth:strategies');

  // iterate over strategies, storing them to the model
  for (const provider in strategies) {
    if (strategies.hasOwnProperty(provider)) {
      let strategy = config.get('auth:strategies:' + provider);
      strategy.provider = provider;
      model.strategies.push(strategy);
    }
  }

  self.view('login', model);
}

// process a login request given a provider
function processLogin(provider) {
  let self = this;

  // use custom callbacks
  self.custom();

  // get the strategy from the config and auth with it if it exists.
  let strategy = config.get(`auth:strategies:${provider}`);
  if (!strategy) return self.res.send(404, 'Unknown provider: ' + provider);
  passport.authenticate(provider, strategy.options.auth)(self.req, self.res, () => { });
}

// process the callback from the provider
function processLoginCallback(provider) {
  let self = this;

  // error handling and defaults init
  let strategy = config.get(`auth:strategies:${provider}`);
  if (!strategy) return self.res.send(404, 'Unknown provider: ' + provider);

  strategy.options.callback = strategy.options.callback || { };
  strategy.options.callback.successRedirect = strategy.options.callback.successRedirect || '/';
  strategy.options.callback.failureRedirect = strategy.options.callback.failureRedirect || '/special/login';

  // try to authenticate with passport using custom callback
  passport.authenticate(provider, (err, user, info) => {
    if (err) return self.redirect(strategy.options.callback.failureRedirect + '?err=err.auth.failure');

    // check emails against the list to ensure they are allowed
    let checkEmail = email => {
      const emails = config.get('auth:emails'),
            whitelist = config.get('auth:whitelist');

      for (const check of emails) {
        if (check.startsWith('/')) {
          let flagIndex = check.lastIndexOf('/');
          if (email.match(new RegExp(check.substr(1, flagIndex), check.substr(flagIndex + 1))))
            return whitelist;
        } else if (check === email) return whitelist;
      }
      return !whitelist;
    };

    // check the email
    if (checkEmail(user.email))
      // emails is good so init the session
      self.req.login(user, err => {
        if (err) return self.redirect(strategy.options.callback.failureRedirect
          + '?err=err.generic&msg=' + err.toString().replace(/\s/g, '+'));
        self.redirect(strategy.options.callback.successRedirect);
      });
    else {
      // email is bad so redirect
      let err = 'err.auth.' + (config.get('auth:whitelist') ? 'whitelist' : 'blacklist');
      self.redirect(strategy.options.callback.failureRedirect + '?err=' + err);
    }
  })(self.req, self.res, (err) => {
    if (err) F.response500(self.req, self.res, err);
  });
}

// Log out the user and redirect to the given page or homepage
function processLogout() {
  this.req.logout();
  this.redirect(this.query.page || '/');
}
