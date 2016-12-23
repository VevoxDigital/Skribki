'use strict';

const pkg = require('../package.json');

F.config.name = 'Skribki';
F.config.version = pkg.version;
F.config.author = pkg.author;

for (const key in F.config)
  if (F.config.hasOwnProperty(key) && key.match(/\./)) {
    let keys = key.split(/\./), val = F.config[key];
    let obj = F.config;
    for (const k of keys.slice(0, keys.length - 1)) {
      obj[k] = obj[k] || { };
      obj = obj[k];
    }
    obj[keys[keys.length - 1]] = val;
    delete F.config[key];
  }
