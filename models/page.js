'use strict';

const lockfile  = require('lockfile'),
      fs        = require('fs-extra'),
      path      = require('path'),
      q         = require('q'),
      assert    = require('assert'),
      _         = require('lodash'),
      git       = require('simple-git');

exports.id = 'page';
exports.wikiPath = path.join(__dirname, '..', 'wiki');

/**
  * @function install
  * Syncronous install function, called once when the model is loaded.
  */
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


/**
  * @function uninstall
  * Syncronous uninstall method. Called when the model is unloading
  */
exports.uninstall = () => {
  delete F.path.wiki;
  lockfile.unlockSync(F.path.wiki('repo.lck'));
};


/**
  * @function workingFile
  * Gets the workingFile for the given route after normalizing it
  * The working file is resolved if found, else an error is thrown
  *
  * @param route The route
  * @return Promise
  */
exports.workingFile = route => {
  route = Utils.normalize(route);
  if (route === '/') route = '';
  if (path.dirname(route).split(/\//g).indexOf('index') >= 0)
    throw new Error(`'index' cannot be a directory`);

  let deferred = q.defer();

  fs.stat(F.path.wiki(route), (err, stats) => {
    if (err) return err.message.startsWith('ENOENT') ? deferred.resolve(route) : deferred.reject(err);
    deferred.resolve(stats.isDirectory() ? route + '/index' : route);
  });

  return deferred.promise;
};


/**
  * @function read
  * Reads the given route, returning the file or directory contents if found and
  * throwing an error if not.
  *
  * @param route The route
  * @return Promise
  */
exports.read = (route, $readAnyway) => {
  return exports.workingFile(route).then(route => {
    let deferred = q.defer();

    if (route.endsWith('/index') && !$readAnyway)
      fs.stat(F.path.wiki(route), (err, stats) => {
        if (!err && stats.isFile()) deferred.resolve(exports.read(route, true));
        else if (err.message.startsWith('ENOENT')) fs.readdir(F.path.wiki(path.dirname(route)), (err, files) => {
          if (err) return err.message.startsWith('ENOENT') ? deferred.resolve() : deferred.reject(err);
          deferred.resolve(files);
        });
        else deferred.reject(err);
      });
    else {
      fs.readFile(F.path.wiki(route), (err, data) => {
        if (err) return err.message.startsWith('ENOENT') ? deferred.resolve() : deferred.reject(err);
        deferred.resolve(data.toString());
      });
    }

    return deferred.promise;
  });
};


/**
  * @function makeDirs
  * Creates a promising function for the given route to create all necessary directores
  *
  * @param rt The route
  * @return Function
  */
exports.makeDirs = rt => {
  return (route = Utils.normalize(rt)) => {
    return q.nfcall(fs.ensureDir, F.path.wiki(path.dirname(route))).then(() => { return route; });
  };
};


/**
  * @function modifyFile
  * Creates a file modification lock for the given file then applies the function.
  * When the function calls its callback, the file is unlocked.
  *
  * The returning promise is resolved with the data passed into the function's
  * callback, or rejected on error.
  *
  * @param rt The route
  * @param func The function to call
  * @return Promise
  */
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


/**
  * @function write
  * Writes the given data to the route
  *
  * @param rt The route
  * @param data The data to write
  * @return Promise
  */
exports.write = (rt, data) => {
  assert.equal(typeof data, typeof { }, 'data should be an object, got ' + typeof data);
  assert.equal(typeof data.name, 'string', 'data should have string name');
  assert.equal(typeof data.email, 'string', 'data should have string email');
  assert.equal(typeof data.body, 'string', 'data should have string body');
  data.body = data.body.replace(/\r(?:\n)?/g, '\n');

  return exports.modifyFile(rt, (route, done) => {
    fs.writeFile(F.path.wiki(route), data.body, err => {
      if (err) return done(err);
      data.message = Utils.escape(data.message || 'Update ' + route);
      F.repository.add('.' + route)
        .commit(data.message, { '--author': `"${data.name} <${data.email}>"` }, done);
    });
  });
};


/**
  * @function removeIfEmpty
  * Removes the given route's directory if its empty. The promise is always resolved
  * with no data unless there is an error
  *
  * @param route
  * @return Promise
  */
exports.removeIfEmpty = route => {
  return q.nfcall(fs.readdir, F.path.wiki(route)).then(files => {
    if (files.length === 0) return q.nfcall(fs.rmdir, F.path.wiki(route))
      .then(exports.removeIfEmpty(path.dirname(route)));
  });
};


/**
  * @function delete
  * Deletes the page at the given route and commits the deletion
  *
  * @param rt The route
  * @param data The commit data.
  * @return Promise
  */
exports.delete = (rt, data = { }) => {
  assert.equal(typeof data, typeof { }, 'data should be an object, got ' + typeof data);
  assert.equal(typeof data.name, 'string', 'data should have string name');
  assert.equal(typeof data.email, 'string', 'data should have string email');

  return exports.modifyFile(rt, (route, done) => {
    fs.unlink(F.path.wiki(route), err => {
      if (err) return done(err);
      data.message = Utils.escape(data.message || 'Delete ' + route);
      F.repository.add('.' + route)
        .commit(data.message, { '--author': `"${data.name} <${data.email}>"` }, (err) => {
          if (err) done(err);
          else done(null, exports.removeIfEmpty(path.dirname(route)));
        });
    });
  });
};

/**
  * @function parseDocument
  * Parses the given string as a page document, returning the resulting parsed data in a promise
  *
  * @param doc The document to parse
  * @return Promise
  */
// TODO Solve the complexity issue the right way.
/* eslint complexity: 0 */
exports.parseDocument = doc => {
  if (typeof doc === 'string') {
    let docPattern = /\n[^\$]/;

    let bodyIndex, header, body;
    if (doc.match(docPattern)) {
      bodyIndex = doc.startsWith('$') ? docPattern.exec(doc).index + 1 : 0;
      header = doc.substring(0, bodyIndex);
      body = doc.substring(bodyIndex);
    } else {
      bodyIndex = 0;
      header = doc.startsWith('$') ? doc : '';
      body = doc.startsWith('$') ? '' : doc;
    }

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
  } else if (doc instanceof Array) {
    let data = { };

    for (const file of doc) {
      let name = path.basename(file),
          letter = name.substring(0, 1).toUpperCase();
      data[letter] = data[letter] || [];
      data[letter].push(name);
    }

    return q(data);
  } else return q();
};


/**
  * @function parse
  * Executes all loaded parsers on the given string, returning the resulting html in a promise
  *
  * @param body The body to parse
  * @return Promise
  */
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


/**
  * @function history
  * Gets the history for the given route
  *
  * @param rt The route
  * @return Promise
  */
exports.history = rt => {
  assert.equal(typeof rt, 'string', 'route must be a string');
  let deferred = q.defer();

  exports.workingFile(rt).then((route = Utils.normalize(rt)) => {
    F.repository.log(['--', route.substring(1)], (err, results) => {
      if (err) deferred.reject(err);
      deferred.resolve(results.all);
    });
  });

  return deferred.promise;
};
