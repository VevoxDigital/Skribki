'use strict';

const {EventEmitter} = require('events');

const SIGN_PREFIX = 'ssid_';

exports.name = 'session';

// session class
class Session extends EventEmitter {
  constructor() {
    super();
    this._opts = { cookie: '__ssid', secret: 'BAZ', timeout: '5 minutes' };
  }

  // getter and setter for options, automatically extend existing opts
  set options(opts) {
    this._opts = U.extend(this._opts, opts, true);
  }
  get options() {
    return this._opts;
  }

  // sign the id
  sign(id, req) {
    return `${id}|${req.ip.replace(/\./g, '_')}|`
      + (req.headers['user-agent'] || 'user-agent:no-agent').substring(0,11).replace(/\.|\s/g, '_');
  }

  // write to the session/cache
  write(id, data) {
    F.cache.add(id, data, this.options.timeout);
    this.emit('write', id, data);
  }

  // read from the session/cache
  read(req, res, next) {
    let id = req.cookie(this.options.cookie);
    if (!id) return this.create(req, res, next);

    let obj = F.decrypt(id, this.options.secret);
    if (!obj) return this.create(req, res, next);

    if (SIGN_PREFIX + obj.sign !== this.sign(obj.id, req))
      return this.create(req, res, next);

    req._sessionId = obj.id;
    req._session = this;

    let session = F.cache.read(obj.id);
    req.session = session || { };
    this.emit('read', req._sessionId, session);

    next();
  }

  // create a new empty session
  create(req, res, next) {
    let id = U.GUID(10),
      obj = { id: SIGN_PREFIX + id, sign: this.sign(id, req) },
      json = F.encrypt(obj, this.options.secret);

    req._sessionId = id;
    req._session = this;
    req.session = { };
    if (res && res.statusCode) res.cookie(this.options.cookie, json);

    next();
  }
}

// install the middleware
exports.install = (opts) => {
  exports.instance = new Session();
  exports.instance.options = opts;

  F.middleware(exports.name, (req, res, next) => {
    let wf = () => exports.instance.write(req._sessionId, req.session);
    if (res.statusCode) res.once('finish', wf); // check if we're using Node or Framework response style
    else res.socket.on('close', wf);

    exports.instance.read(req, res, next);
  });
};

// uninstall the middleware
exports.uninstall = () => {
  F.uninstall('middleware', exports.id);
  delete exports.instance;
};
