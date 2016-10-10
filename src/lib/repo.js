'use strict';

const Q       = require('q'),
      git     = require('simple-git'),
      path    = require('path'),
      fs      = require('fs-extra'),
      config  = require('nconf');

exports = module.exports = (svr) => {
  let deferred = Q.defer();

  svr.cwd = path.join(ROOTDIR, 'wiki');
  svr.repo = git()/*.silent(true)*/.cwd(svr.cwd);

  fs.exists(svr.cwd, (err, exists) => {
    if (err) return deferred.reject(err);
    if (exists && !fs.statSync(svr.cwd).isDirectory())
      deferred.reject(new Error('File "wiki" exists but is not a directory'));
    else if (!exists) {
      fs.mkdirsSync(svr.cwd);
      svr.repo.init();
    }
    deferred.resolve(svr);
  });

  return deferred.promise;
};
