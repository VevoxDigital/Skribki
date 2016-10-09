'use strict';

const path  = require('path'),
      Q     = require('q');

global.ROOTDIR = path.join(__dirname, '..');

// Init everything.
const output = Q.when(require('./lib/logger'))
  .then(() => {
    LOG.info('init phase ok');
  })
  .catch(e => {
    console.log(e);
  })
  .fail(e => {
    // TODO Write a failure handler.
    console.log(e);
  })
  .finally(() => {
    let msg = 'server init done';
    if (global.LOG) return LOG.info(msg);
    else console.log(msg);
  })
  .done();
