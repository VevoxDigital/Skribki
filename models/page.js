'use strict';

const lockfile  = require('lockfile'),
      fs        = require('fs-extra'),
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
      body: '$title Home\n$desc  Welcome to your new Skribki!\n'
        + fs.readFileSync(path.join(__dirname, '..', 'readme.md')).toString(),
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

exports.normalizePath = (route = '') => {
  assert.strictEqual(typeof route, 'string', 'route should be a string');

  // remove any leading dots (non-leading dots are handled later)
  while (route.startsWith('.')) route = route.substring(1);

  // normalize slashes
  if (route.endsWith('/')) route = route.slice(0, -1);
  if (!route.startsWith('/')) route = '/' + route;

  // normalize the path
  route = path.normalize(route);
  return route;
};

exports.workingFile = route => {
  let deferred = q.defer();
  route = exports.normalizePath(route);
  if (route === '/') route = '';

  if (path.dirname(route).split(/\//g).indexOf('index') >= 0)
    deferred.reject(new Error(`'index' cannot be a directory`));

  fs.stat(F.path.wiki(route), (err, stats) => {
    if (err) return deferred.resolve(); // missing file means we resolve with no data.
    deferred.resolve(stats.isDirectory() ? exports.workingFile(route + '/index') : route);
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

exports.makeDirs = rt => {
  return (route = exports.normalizePath(rt)) => {
    return q.nfcall(fs.ensureDir, F.path.wiki(path.dirname(route))).then(() => { return route; });
  };
};

exports.modifyFile = (rt, func) => {
  return exports.workingFile(rt).then(exports.makeDirs(rt)).then(route => {
    let deferred = q.defer();

    // lock the file to avoid any weird commits with two simultanious edits
    // wait 2 seconds for other locks to be released
    lockfile.lock(F.path.wiki(route + '.lck'), { wait: 2000 }, err => {
      if (err) return deferred.reject(err);
      func(route, (e, v) => {
        lockfile.unlock(F.path.wiki(route + '.lck'), err => {
          if (e || err) return deferred.reject(e || err);
          deferred.resolve(v);
        });
      });
    });

    return deferred.promise;
  });
};

// TODO Patch in the changes instead of writing over.
// If two edits occur, one overwrites the other.
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

exports.removeIfEmpty = route => {
  return q.nfcall(fs.readdir, F.path.wiki(route)).then(files => {
    if (files.length === 0) return q.nfcall(fs.rmdir, F.path.wiki(route))
      .then(exports.removeIfEmpty(path.dirname(route)));
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
        .commit(data.message || 'Delete ' + route, { '--author': `"${data.name} <${data.email}>"` }, (err) => {
          if (err) done(err);
          else done(null, exports.removeIfEmpty(path.dirname(route)));
        });
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

exports.history = rt => {
  assert.equal(typeof rt, 'string', 'route must be a string');
  let deferred = q.defer();

  exports.workingFile(rt).then((route = exports.normalizePath(rt)) => {
    F.repository.log(['--', route.substring(1)], (err, results) => {
      if (err) deferred.reject(err);
      deferred.resolve(results.all);
    });
  });

  return deferred.promise;
};
