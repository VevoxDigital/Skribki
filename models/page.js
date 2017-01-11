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
  } catch (e) {
    console.error('failed to lock repository, it may be in use');
    console.error(e);
    F.kill(-1);
  }

  let repo = git(F.path.wiki());
  F.repository = repo;

  try {
    if (!fs.statSync(F.path.wiki('.git')).isDirectory()) throw new Error();
  } catch (e) {
    // repo isn't initialized, need to do so.
    repo.init().addConfig('user.email', 'skribki@localhost')
      .addConfig('user.name', 'Skribki');

    let data = {
      body: fs.readFileSync(path.join(__dirname, '..', 'readme.md')).toString(),
      name: 'Skribki',
      email: 'skribki@localhost',
      message: 'Initial Commit'
    };
    exports.write('index', data).then(() => { }).catch(e => { throw e; }).done();
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

exports.modifyFile = (rt, func) => {
  let deferred = q.defer();

  exports.workingFile(rt).then(route => {
    route = route ? route : '.' + exports.normalizePath(rt);
    if (route === '.') return deferred.reject(new Error('cannot create file at "/"'));

    // lock the file to avoid any weird commits with two simultanious edits
    // wait 2 seconds for other locks to be released
    lockfile.lock(F.path.wiki(route + '.lck'), { wait: 2000 }, err => {
      if (err) return deferred.reject(err);
      func(route, e => {
        lockfile.unlock(F.path.wiki(route + '.lck'), err => {
          if (e || err) return deferred.reject(e || err);
          deferred.resolve();
        });
      });
    });
  });

  return deferred.promise;
};

exports.write = (rt, data) => {
  assert.equal(typeof data, typeof { }, 'data should be an object, got ' + typeof data);
  assert.equal(typeof data.name, 'string', 'data should have string name');
  assert.equal(typeof data.email, 'string', 'data should have string email');
  assert.equal(typeof data.body, 'string', 'data should have string body');
  data.body = data.body.replace(/\r(?:\n)?/g, '\n');

  return exports.modifyFile(rt, (route, done) => {
    fs.writeFile(F.path.wiki(route), data.body, err => {
      if (err) return done(err);
      F.repository.add('.' + route)
        .commit(data.message || 'Update ' + route, { '--author': `"${data.name} <${data.email}>"` }, done);
    });
  });
};

exports.delete = (rt, data = { }) => {
  assert.equal(typeof data, typeof { }, 'data should be an object, got ' + typeof data);
  assert.equal(typeof data.name, 'string', 'data should have string name');
  assert.equal(typeof data.email, 'string', 'data should have string email');

  return exports.modifyFile(rt, (route, done) => {
    fs.unlink(F.path.wiki(route), err => {
      if (err) return done(err);
      F.repository.add('.' + route)
        .commit(data.message || 'Delete ' + route, { '--author': `"${data.name} <${data.email}>"` }, done)
    });
  });
};

exports.parseDocument = doc => {
  if (!doc) return q(); // if we get empty input, resolve an empty promise;
  assert.equal(typeof doc, 'string', 'document should be a string');
  let bodyIndex = doc.startsWith('$') ? /\n[^\$]/.exec(doc).index + 1 : 0,
      header = doc.substring(0, bodyIndex),
      body = doc.substring(bodyIndex);

  let result = { header: { title: 'Page', desc: 'An unnamed wiki page.' }, toc: [] };
  for (let headerLine of header.split('\n')) {
    headerLine = headerLine.trim();
    let key = headerLine.substring(1, headerLine.indexOf(' ')),
        val = headerLine.substring(headerLine.indexOf(' ')).trim();
    result.header[key] = val;
  }

  return exports.parse(body).then(r => {
    result.body = r;
    let headerPattern = /<h([1-3]).*id="([^"]+)">([^<]+)/gi, match;
    while ((match = headerPattern.exec(result.body)) !== null)
      result.toc.push({
        level: parseInt(match[1], 10),
        id: match[2],
        content: match[3]
      });
    return result;
  });
};

exports.parse = body => {
  assert.equal(typeof body, 'string', 'body should be a string');
  let deferred = q.defer();

  fs.readdir(F.path.models('parsers'), (err, files) => {
    if (err) deferred.reject(err);

    body = q(body);
    for (const file of files) body = body.then(require(F.path.models('parsers/' + file)).run); // eslint-disable-line
    deferred.resolve(body);
  });

  return deferred.promise;
};

exports.history = (route) => {
  assert.equal(typeof route, 'string', 'route must be a string');
  route = exports.normalizePath(route);

  let deferred = q.defer();

  fs.stat(F.path.wiki(route), (err, stats) => {
    if (!err && stats.isDirectory()) {
      route += '/index';
      return deferred.resolve(exports.history(route));
    } else {
      F.repository.log(['--', route.substring(1)], (err, results) => {
        if (err) deferred.reject(err);
        deferred.resolve(results.all);
      });
    }
  });

  return deferred.promise;
};
