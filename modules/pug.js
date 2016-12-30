/**
  * PugJS view engine for TotalJS
  */

const pug = require('pug'),
      fs  = require('fs');

let frameworkEngine;

exports.name = 'pug';
exports.instance = pug;

// create the parser function and cache it.
const createParserFunction = (self, key, name, filename) => {
  let ext = '.' + exports.name,
      path = F.path.views(filename + ext),
      exists = false;

  try {
    exists = fs.statSync(path).isFile();
  } catch (e) { /* no-op */ }

  if (!exists) return self.view500(`View ${name} (${path}) failed to load.`);

  let opts = U.extend({ filename: path }, exports.options),
      fn = pug.compile(fs.readFileSync(path).toString('utf8'), opts);

  // cache for 4 minutes if we're not debugging.
  if (!self.config.debug && fn !== null)
    F.cache.add(key, fn, F.datetime.add('m', 4));

  if (fn === null) return self.view500(`View ${name} (${path}) failed to load.`);
  return fn;
};

exports.install = opts => {
  frameworkEngine = Controller.prototype.view;
  /* eslint complexity: ['error', 7] */
  Controller.prototype.view = function (name, model = { }, headers, isPartial) {
    let self = this;

    // shift arguments if needed
    if (isPartial === undefined && typeof headers === 'boolean') {
      isPartial = headers;
      headers = null;
    }

    // if it already succeeded and didn't need to be parsed
    if (self.res.success && !isPartial) return self;

    let skip = name.startsWith('~'),
        filename = name;

    if (skip) filename = name.substring(1);

    let key = 'pug_' + filename,
        fn = F.cache.read2(key) || createParserFunction(self, key, name, filename);
    if (typeof fn !== 'function') return self;

    let locals = {
      model: model,
      controller: self,
      config: F.config,
      repository: self.repository,
      user: self.user,
      global: F.global,
      url: self.url,
      translate: (key) => { return F.localize(self.req, key); }
    };

    self.subscribe.success();
    if (self.isConnected) {
      F.responseContent(self.req, self.res, self.status, fn(locals), 'text/html', true, headers);
      F.stats.response.view++;
    }

    return self;
  };
};

exports.uninstall = () => {
  Controller.prototype.view = frameworkEngine;
};
