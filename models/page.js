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

exports.read = route => {
  let deferred = q.defer();

  // verify params are in order
  try {
    assert.strictEqual(typeof route, 'string', 'url should be a string');
  } catch (e) { deferred.reject(e); }

  // sanitize the route a bit to avoid reading files outside the wiki dir.
  route = path.normalize(route);

  // stat the route
  // we should only reject on error; missing files resolve with no data
  if (route.endsWith('/')) route = route.slice(0, -1);
  let file = path.join(exports.wikiPath, route);
  fs.stat(file, (err, stats) => {
    if (err) return deferred.resolve(); // if file doesn't exist, resolve with no data
    if (stats.isDirectory()) // if directory, look for an index file and try to read that
      return deferred.resolve(exports.read(route + '/index'));
    // exists and is file, try reading
    fs.readFile(file, (err, data) => {
      if (err) return deferred.reject(err);
      deferred.resolve(data.toString()); // resolve with the file's contents
    });
  });

  return deferred.promise;
};
