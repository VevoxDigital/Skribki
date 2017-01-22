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
  /* eslint complexity: 0 */
  Controller.prototype.view = function (name, model = { }, headers, isPartial) {
    // shift arguments if needed
    if (isPartial === undefined && typeof headers === 'boolean') {
      isPartial = headers;
      headers = null;
    }

    // if it already succeeded and didn't need to be parsed
    if (this.res.success && !isPartial) return this;

    let skip = name.startsWith('~'),
        filename = name;

    if (skip) filename = name.substring(1);

    let key = 'pug_' + filename,
        fn = F.cache.read2(key) || createParserFunction(this, key, name, filename);
    if (typeof fn !== 'function') return this;

    let localizer = function (key) {
      return Utils.localize.apply(undefined, [ this.req, key ].concat(arguments));
    };

    let locals = {
      model: model,
      controller: this,
      config: F.config,
      repository: this.repository,
      user: this.user,
      global: F.global,
      url: this.url,
      translate: localizer,
      name: name
    };

    this.subscribe.success();
    if (this.isConnected) {
      try {
        F.responseContent(this.req, this.res, this.status, fn(locals), 'text/html', true, headers);
        F.stats.response.view++;
      } catch (e) {
        this.throw500(e);
        LOG.error('view engine failure');
        LOG.error(e);
      }
    }

    return this;
  };
};

exports.uninstall = () => {
  Controller.prototype.view = frameworkEngine;
};
