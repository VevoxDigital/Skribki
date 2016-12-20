'use strict';

const lockfile  = require('lockfile'),
      fs        = require('fs'),
      path      = require('path'),
      q         = require('q'),
      assert    = require('assert'),
      git       = require('simple-git');

exports.id = 'page';
exports.wikiPath = path.join(__dirname, '..', 'wiki');

exports.install = () => {
  F.path.wiki = (p = '') => { return path.join(exports.wikiPath, p); }
  try {
    fs.mkdirSync(F.path.wiki());
  } catch (e) { /* no-op */ }
  try {
    lockfile.lockSync(F.path.wiki('repo.lck'));
    git(F.path.wiki()).init();
  } catch (e) {
    console.error('failed to lock repository, it may be in use');
    console.error(e);
    F.kill(-1);
  }
};

exports.uninstall = () => {
  delete F.path.wiki;
  lockfile.unlockSync(F.path.wiki('repo.lck'));
};

exports.normalizePath = route => {
  assert.strictEqual(typeof route, 'string', 'route should be a string');

  // normalize to root to avoid stepping out of cwd
  if (!route.startsWith('/')) route = '/' + route;
  if (route.endsWith('/')) route = route.slice(0, -1);
  route = path.normalize(route);

  return route;
};

exports.workingFile = route => {
  let deferred = q.defer();
  route = exports.normalizePath(route);

  fs.stat(path.join(exports.wikiPath, route), (err, stats) => {
    if (err) return deferred.resolve(); // missing file means we resolve with no data.
    route = stats.isDirectory() ? route + '/index' : route;
    deferred.resolve(route);
  });

  return deferred.promise;
};

exports.read = route => {
  return exports.workingFile(route).then(route => {
    if (!route) return;
    let deferred = q.defer();
    fs.readFile(F.path.wiki(route), (err, data) => {
      if (err) return deferred.reject(err);
      deferred.resolve(data.toString());
    });
    return deferred.promise;
  });
};
