'use strict';

const fs    = require('fs-extra'),
      git   = require('simple-git'),
      path  = require('path'),
      q     = require('q');

const wikiDir = path.join(__dirname, '..', 'wiki');

exports.id = 'page';
exports.version = '1';

exports.install = () => {
  fs.ensureDirSync(wikiDir);
  let wiki = git(wikiDir);
  if (!fs.existsSync(path.join(wikiDir, '.git'))) {
    LOG.info('wiki repository missing or not initialized. doing so now');
    try {

      // init, copy files over, and commit them
      wiki.init()
        .addConfig('user.email', 'skribki@localhost')
        .addConfig('user.name', 'Skribki');
      fs.copySync(path.join(__dirname, '..', 'home.md'), path.join(wikiDir, 'home'));
      fs.copySync(path.join(__dirname, '..', 'tester.md'), path.join(wikiDir, 'tester'));
      wiki.add('home').add('tester').commit('Initial commit', { '--author': '"Skribki <skribki@localhost>"' });
      LOG.info('wiki repository initialized');

    } catch (e) {

      // if repo init fails
      LOG.error('wiki did not ')
      LOG.error('Could not initialize the repository');
      LOG.error(e.stack);
      F.stop(-1);

    }
  } else LOG.info('repository appears to be initialized and okay');
};

// verify content is as it should be.
exports.verifyContentIntegrety = (content) => {
  if (typeof content.title !== 'string')
    throw new Error('content title must be a string');
  if (typeof content.desc !== 'string')
    throw new Error('content description must be a string');
  if (content.categories
    && (typeof content.categories !== 'object'
    && typeof content.categories.length !== 'number'))
    throw new Error('content categories must be falsy or a valid array');
  if (typeof content.body !== 'string')
    throw new Error('content body must be a string');
};

// parse the given raw data
exports.parse = raw => {
  let deferred = q.defer();

  // if the raw is the contents of a file
  if (typeof raw === 'string') {
    let content = { title: 'A Wiki Page', desc: '', categories: [], body: raw },
        lines = raw.split('\n');

    // extract meta from the file
    const linePattern = /^\$([\S]+)\s+(.+)$/;
    for (let line of lines) {
      line = line.trim();
      let matches = line.match(linePattern);
      if (!matches) break;

      content[matches[1]] = JSON.parse(matches[2]);
      content.body = content.body.substring(content.body.indexOf('\n') + 1, content.body.length);
    }

    // get all the parsers from the parsersDir
    const parsersDir = path.join(__dirname, '..', 'extensions', 'parsers');
    let parsers = [];
    fs.walk(parsersDir)
      .on('data', item => {
        try {
          if (item.stats.isFile() && path.extname(item.path) === '.js')
            parsers.push(require(item.path)); // eslint-disable-line global-require
        } catch (e) {
          LOG.warn('failed to load parser');
          LOG.warn(e.stack);
        }
      }).on('end', () => {
        // parse everything based on the parsers
        parsers.reduce((cur, next) => { return cur.then(next); }, q(content.body)).then((body) => {
          content.toc = [];

          // look for headers and add them to the ToC
          let headerPattern = /<h([123])[^>]*>(.+)<\/h[123]>/igm, m;
          while ((m = headerPattern.exec(body))) {
            content.toc.push({
              tagS: '<h' + m[1] + '>',
              tagE: '</h' + m[1] + '>',
              title: m[2],
              hash: m[2].toLowerCase().replace(/[^a-z0-9]/ig, '-')
            });
          }

          return body;
        }).then(parsed => {
          content.body = parsed;
          try {
            // verify content is good, then resolve with it
            exports.verifyContentIntegrety(content);
            deferred.resolve(content);
          } catch (e) {
            // if content is bad, reject with the error
            deferred.reject(e);
          }
        }).catch(err => { deferred.reject(err); });
      });
  } else if (typeof raw === 'object') {
    // if raw is a list of files in a directory
    let page = '<h1>Directory Contents</h1>' +
      '<p>This directory has no homepage. The contents of the directory are listed below:</p>' +
      '<div class="page-filelist">';

    // add link to each item, not recursive
    raw.arr.forEach(item => {
      page += `
        <a href="${raw.route}${item.name}">
          <i class="fa fa-${item.isDir ? 'folder' : 'file-text-o'}"></i>
          ${item.isDir ? '<strong>' : ''}${item.name}${item.isDir ? '</strong>' : ''}
        </a>`;
    });

    // resolve with the HTML result
    deferred.resolve({
      title: 'Directory',
      desc: 'Currently viewing files for: ' + raw.route.slice(0, -1),
      body: page + '</div>'
    });
  } else throw new Error('Cannot parse: invalid input as ' + typeof raw);

  return deferred.promise;
};

// read the raw data out of a wiki file
exports.readRaw = r => {
  let deferred = q.defer();

  let route = r || '/', p = path.join(wikiDir, route.substring(1));
  if (p.endsWith('/')) p = p.slice(0, -1);

  // start by checking the file
  fs.stat(p, (err, stats) => {
    if (err) return deferred.reject(err);

    // is directory?
    if (stats.isDirectory()) {
      let homeFile = path.join(p, 'home');
      if (fs.existsSync(homeFile)) p = homeFile; // the home file exists, so read that
      else {
        // home file does not exist. build an array and resolve that
        let files = fs.readdirSync(p), dir = { route: route, arr: [] };
        files.sort();
        for (const file of files) {
          let stat = fs.statSync(path.join(p, file));
          dir.arr.push({ name: file, isDir: stat.isDirectory() });
        }
        return deferred.resolve(dir);
      }
    }

    // if we haven't resolved already (i.e. has home or is file), read the file and resolve it
    fs.readFile(p, (err, data) => {
      if (err) return deferred.reject(err);
      deferred.resolve(data.toString());
    });
  });

  return deferred.promise;
};

// helper method that calls read and parse together
exports.read = (r) => {
  return q(exports.readRaw(r)
    .then(exports.parse));
};

// TODO create
// TODO update
// TODO delete
