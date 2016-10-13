'use strict';

const Q       = require('q'),
      git     = require('simple-git'),
      path    = require('path'),
      fs      = require('fs-extra'),
      config  = require('nconf');

exports = module.exports = (svr) => {
  let deferred = Q.defer();

  svr.cwd = path.join(ROOTDIR, config.get('repo:cwd') || 'wiki');
  svr.repo = git()/*.silent(true)*/.cwd(svr.cwd);

  fs.exists(svr.cwd, (err, exists) => {
    if (err) return deferred.reject(err);
    if (exists && !fs.statSync(svr.cwd).isDirectory())
      return deferred.reject(new Error('File "wiki" exists but is not a directory'));
    else if (!exists) {
      fs.mkdirsSync(svr.cwd);
      svr.repo.init();

      fs.copy(path.join(ROOTDIR, 'public', 'tpl'), svr.cwd, err => {
        if (err) return deferred.reject(err);
        svr.repo.add('./').commit('Initial Commit', { '--author': `"${svr.svrAuthor}"` });
        deferred.resolve(svr);
      });
    } else deferred.resolve(svr);
  });

  return deferred.promise;
};
