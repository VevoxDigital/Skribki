'use strict';

const Q       = require('q'),
      git     = require('simple-git'),
      path    = require('path'),
      fs      = require('fs-extra'),
      config  = require('nconf');

exports = module.exports = (svr) => {
  let deferred = Q.defer();

  svr.cwd = config.get('repo:cwd');
  fs.ensureDir(svr.cwd, err => {
    if (err) return deferred.reject(err);

    svr.repo = git().silent(true).cwd(svr.cwd);
    svr.repo.status((err, status) => {
      if (!status) svr.repo.init(config.get('repo:bare'));
      console.log(status);
      deferred.resolve(svr);
    });
  });

  return deferred.promise;
};
