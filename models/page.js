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

exports.create = (route, author, done) => {
  verifyWikiDirectory();
  console.log('create ' + route + ' from ' + author);
  done();
};

exports.parse = raw => {
  let deferred = q.defer();

  if (typeof raw === 'string') {
    let content = { title: 'A Wiki Page', desc: '', categories: [], body: raw }, lines = raw.split('\n');

    const linePattern = /^\$([\S]+) (.+)$/;
    for (let line of lines) {
      line = line.trim();
      let matches = line.match(linePattern);

      if (!matches) break;

      content[matches[1]] = JSON.parse(matches[2]);
      content.body = content.body.substring(content.body.indexOf('\n') + 1, content.body.length);
    }

    const parsersDir = path.join(__dirname, '..', 'extensions', 'parsers');
    let parsers = [];
    fs.walk(parsersDir)
      .on('data', item => {
        if (item.stats.isFile() && path.extname(item.path) === '.js')
          parsers.push(require(item.path));
      }).on('end', () => {
        parsers.reduce((cur, next) => { return cur.then(next); }, q(content.body)).then((body) => {
          content.toc = [];

          let headerPattern = /<h([123])[^>]*>(.+)<\/h[123]>/igm, m;
          while (m = headerPattern.exec(body)) {
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
          deferred.resolve(content);
        }).catch(err => { deferred.reject(err); });
      });
  } else if (typeof raw === 'object') {
    let page = '<h1>Directory Contents</h1>' +
      '<p>This directory has no homepage. The contents of the directory are listed below:</p>' +
      '<div class="page-filelist">';

    raw.arr.forEach(item => {
      page += `
        <a href="${raw.route}${item.name}">
          <i class="fa fa-${item.isDir ? 'folder' : 'file-text-o'}"></i>
          ${item.isDir ? '<strong>' : ''}${item.name}${item.isDir ? '</strong>' : ''}
        </a>`;
    });

    deferred.resolve({
      title: 'Directory',
      desc: 'Currently viewing files for: ' + raw.route.slice(0, -1),
      body: page + '</div>'
    });
  } else throw new Error('Cannot parse: invalid input as ' + typeof raw);

  return deferred.promise;
};

exports.readRaw = r => {
  let deferred = q.defer();

  let route = r || '/', p = path.join(wikiDir, route.substring(1));
  if (p.endsWith('/')) p = p.slice(0, -1);

  fs.stat(p, (err, stats) => {
    if (err) return deferred.reject(err);

    if (stats.isDirectory()) {
      let homeFile = path.join(p, 'home');
      if (fs.existsSync(homeFile)) p = homeFile;
      else {
        let files = fs.readdirSync(p), dir = { route: route, arr: [] };
        files.sort();
        for (const file of files) {
          let stat = fs.statSync(path.join(p, file));
          dir.arr.push({ name: file, isDir: stat.isDirectory() });
        }
        return deferred.resolve(dir);
      }
    }

    // Not else because home file expects continue
    fs.readFile(p, (err, data) => {
      if (err) return deferred.reject(err);
      deferred.resolve(data.toString());
    });
  });

  return deferred.promise;
};

exports.read = (r) => {
  let deferred = q.defer();

  self.readRaw(r).then(raw => {
    if (typeof raw === 'array') deferred.resolve(raw);
    else deferred.resolve(self.parse(raw));
  }).catch(err => { console.log(err.stack); deferred.resolve(null); }).done();

  return deferred.promise;
};

exports.update = (route, content, author, done) => {
  verifyWikiDirectory();
  console.log('update ' + route);
  done();
};

exports.delete = (route, done) => {
  verifyWikiDirectory();
  console.log('delete ' + route);
  done();
};

const self = exports;
