'use strict';

const pkg = require('../package.json');

F.config.name = 'Skribki';
F.config.version = pkg.version;
F.config.author = pkg.author;

let oldConfig = CONFIG;

global.CONFIG = key => {
  let val = oldConfig(key);
  LOG.debug(`${key}: ${JSON.stringify(val)}`);
  return val;
};
