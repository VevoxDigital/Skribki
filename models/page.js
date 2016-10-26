'use strict';

const fs    = require('fs-extra'),
      git  = require('simple-git'),
      path  = require('path');

const wikiDir = path.join(__dirname, '..', 'wiki');

exports.id = 'page';
exports.version = '1';

function verifyWikiDirectory() {
  fs.ensureDirSync(wikiDir);
  let wiki = git(wikiDir);
  if (!fs.existsSync(path.join(wikiDir, '.git'))) {
    console.log('Repository is not initialized, doing so now.');
    try {

      wiki.init();
      fs.copySync(path.join(__dirname, '..', 'home.md'), path.join(wikiDir, 'home'));
      wiki.add('home').commit('Initial commit', { '--author': '"Skribki <skribki@localhost>"' });

    } catch (e) {
      console.error('Could not initialize the repository. Exiting now');
      console.error(e.stack);
      process.exit(-1);
    }

  }
}

exports.create = (route, author, done) => {
  verifyWikiDirectory();
  console.log('create ' + route + ' from ' + author);
  done();
};

exports.read = (r, done) => {
  verifyWikiDirectory();

  let route = r === '/' ? '/home/' : r,
      p = path.join(wikiDir, route.substring(1)).slice(0, -1);

  if (fs.existsSync(p)) {
    fs.stat(p, (err, stats) => {
      if (err) return done(err);

      if (stats.isFile()) {

        let reader = require('readline').createInterface({
          input: fs.createReadStream(p)
        });

        let content = { title: 'A Wiki Page', desc: '', categories: [], body: '' };
        reader.on('line', line => {
          let isHeading = true, headingPattern = /^\$([^ ]+) (.+)$/;
          if (line.match(headingPattern) && isHeading) {
            let m = headingPattern.exec(line);
            if (content[m[1]] !== undefined) content[m[1]] = JSON.parse(m[2]);
          } else {
            isHeading = false;
            content.body += line + '\n';
          }
        }).on('close', () => {
          done(null, content);
        });

      } else if (stats.isDirectory()) {

      } else done(null, false);

    });
  } else done(null, false);
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
