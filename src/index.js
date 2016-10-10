'use strict';

const path    = require('path'),
      Q       = require('q'),
      config  = require('nconf');

global.ROOTDIR = path.join(__dirname, '..');

config.argv().env().file(path.join(ROOTDIR, 'config.json'));

// Init everything.
const output = Q.fcall(() => {
  global.SVR = { svrAuthor: 'Skbriki <skbriki@localhost>' };
  return SVR;
}).then(require('./lib/logger'))
  .then(require('./lib/repo'))
  .then((svr) => {
    svr.log.info('init ok');
  })
  .catch(e => {
    if (SVR.log) {
      SVR.log.error('init failed due to an error');
      SVR.log.error(e.stack);
    } else console.log(e.stack);
  })
  .fail(e => {
    console.log('fail', e);
  })
  .finally(() => {
    console.log('fin');
  })
  .done();
