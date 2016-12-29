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
    // TODO Inital commit so tests won't fail trying to reset to HEAD^1
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

exports.write = (route, data) => {
  assert.equal(typeof data, typeof { }, 'data should be an object, got ' + typeof data);
  assert.equal(typeof data.name, 'string', 'data should have string name');
  assert.equal(typeof data.email, 'string', 'data should have string email');
  assert.equal(typeof data.body, 'string', 'data should have string body');
  data.body = data.body.replace(/\r(?:\n)?/g, '\n');

  let deferred = q.defer();

  route = exports.normalizePath(route);
  // lock the file to avoid any weird commits with two simultanious edits
  // wait 2 seconds for other locks to be released
  lockfile.lock(F.path.wiki(route + '.lck'), { wait: 2000 }, err => {
    if (err) return deferred.reject(err);
    fs.writeFile(F.path.wiki(route), data.body, err => {

      // file written with new data, commit to git
      git(F.path.wiki()).add(route.substring(1))
        .commit(data.message || 'Update ' + route, { '--author': `${data.name} <${data.email}>` }, () => {
          lockfile.unlock(F.path.wiki(route + '.lck'), (err) => {
            if (err) return deferred.reject(err);
            deferred.resolve();
          });
        });
    });
  });

  return deferred.promise;
};

exports.parseDocument = doc => {
  assert.equal(typeof doc, 'string', 'document should be a string');
  let bodyIndex = /\n[^\$]/.exec(doc).index + 1,
      header = doc.substring(0, bodyIndex),
      body = doc.substring(bodyIndex);

  let result = { header: { } };
  for (let headerLine of header.split('\n')) {
    headerLine = headerLine.trim();
    let key = headerLine.substring(1, headerLine.indexOf(' ')),
        val = headerLine.substring(headerLine.indexOf(' ')).trim();
    result.header[key] = val;
  }

  return exports.parse(body).then(r => {
    result.body = r;
    return result;
  });
};

exports.parse = body => {
  assert.equal(typeof body, 'string', 'body should be a string');
  let deferred = q.defer();

  fs.readdir(F.path.models('parsers'), (err, files) => {
    if (err) deferred.reject(err);

    body = q(body);
    for (const file of files) body = body.then(require(F.path.models('parsers/' + file)).run);
    deferred.resolve(body);
  });

  return deferred.promise;
};
