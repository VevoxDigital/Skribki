'use strict';

const pkg = require('../package.json');

F.config.name = 'Skribki';
F.config.version = pkg.version;
F.config.author = pkg.author;

let oldConfig = CONFIG;

global.CONFIG = key => {
  let val = oldConfig(key), valStr = JSON.stringify(val);
  if (valStr.length > 43)
    valStr = valStr.substring(0, 20) + '...' + valStr.substring(valStr.length - 21, valStr.length - 1);
  LOG.debug(`config ${key}=${valStr}`);
  return val;
};
