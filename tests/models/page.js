'use strict';

const assert = require('assert'),
      expect = require('expect.js');

const fs    = require('fs-extra'),
      path  = require('path');

const TEST_PATH = '/test~';

function resetCommit(cb) {
  F.repository.reset(['HEAD^1', '--hard', '--'], cb);
}

exports.run = () => {
  const page = F.model('page');

  F.assert('model:page#install', next => {
    expect(F.path.wiki).to.be.a('function');
    expect(F.repository).to.be.an('object');

    expect(fs.statSync).withArgs(F.path.wiki('repo.lck')).to.not.throwException();
    expect(fs.statSync(F.path.wiki('repo.lck')).isFile()).to.be(true);

    expect(fs.statSync).withArgs(F.path.wiki('.git')).to.not.throwException();
    expect(fs.statSync(F.path.wiki('.git')).isDirectory()).to.be(true);
    next();
  });

  F.assert('model:page#normalizePath', next => {
    expect(page.normalizePath('foo/')).to.be('/foo');
    expect(page.normalizePath('../foo/bar')).to.be('/foo/bar');
    expect(page.normalizePath('/')).to.be('/');
    expect(page.normalizePath()).to.be('/');
    expect(page.normalizePath).withArgs(false).to.throwException();
    next();
  });

  F.assert('model:page#workingFile', next => {
    fs.mkdirSync(F.path.wiki(TEST_PATH));
    page.workingFile(TEST_PATH).then(file => {

      expect(file).to.be(TEST_PATH + '/index');
      fs.rmdirSync(F.path.wiki(TEST_PATH));

      return page.workingFile(TEST_PATH).then(file => {
        expect(file).to.be(undefined);

        return page.workingFile('/').then(file => {
          expect(file).to.be('/index');
          next(); // no need to test when the file is present, handled in next test
        });
      });
    }).catch(assert.ifError).done();
  });

  F.assert('model:page#read', next => {
    page.read(TEST_PATH).then(data => {
      expect(data).to.be(undefined);

      fs.writeFileSync(F.path.wiki(TEST_PATH), 'foobar');
      return page.read(TEST_PATH).then(data => {
        expect(data).to.be('foobar');

        fs.unlinkSync(F.path.wiki(TEST_PATH));
        next();
      });
    }).catch(assert.ifError).done();
  });

  F.assert('model:page#makeDirs', next => {
    page.makeDirs('foo/bar/baz')().then(route => {

      try {
        expect(fs.statSync(F.path.wiki(path.dirname(route))).isDirectory()).to.be(true);
      } catch (e) { assert.ifError(e); }
      expect(fs.statSync).withArgs(F.path.wiki(route)).to.throwException(/^ENOENT/);

      fs.removeSync(F.path.wiki('foo'));
      next();

    }).catch(assert.ifError).done();
  });

  F.assert('model:page#modifyFile', next => {
    page.modifyFile(TEST_PATH, (rt, done) => {
      expect(rt).to.be(TEST_PATH);
      expect(fs.statSync).withArgs(F.path.wiki(TEST_PATH + '.lck')).to.not.throwException();
      done();
    }).then(() => {
      expect(fs.statSync).withArgs(F.path.wiki(TEST_PATH + '.lck')).to.throwException(/^ENOENT/);
      next();
    }).catch(assert.ifError).done();
  });

  F.assert('model:page#write', next => {
    page.write(TEST_PATH, {
      name: 'Skribki',
      email: 'skribki@localhost',
      body: 'foobarbaz'
    }).then(() => {
      return page.read(TEST_PATH).then(data => {
        expect(data).to.be('foobarbaz');
        resetCommit(next);
      });
    }).catch(assert.ifError).done();
  });

  F.assert('model:page#delete', next => {
    // we'll be deleting the index to test, since it has to already exist.
    // fortunately, we roll the deletion commit back (hopefully)
    page.delete('/', {
      name: 'Skribki',
      email: 'skribki@localhost'
    }).then(() => {
      expect(fs.statSync).withArgs(F.path.wiki('index')).to.throwException(/^ENOENT/);
      resetCommit(next);
    }).catch(assert.ifError).done();
  });

  F.assert('model:page#parseDocument', next => {
    page.parseDocument('$title foo\n$desc bar\n\n*body*').then(res => {
      expect(res.header.title).to.be('foo');
      expect(res.header.desc).to.be('bar');

      // no need to test parsing, should be handled in parser testing
      expect(res.body).to.be('<p><em>body</em></p>\n');
      next();
    }).catch(assert.ifError).done();
  });

  F.assert('model:page#history', next => {
    // we're assuming the first commit created in 'exports.install' will be there.
    page.history('/').then(history => {
      expect(history).to.be.an('array');

      let commit = history[history.length - 1];
      expect(commit.author_name).to.be('Skribki');
      expect(commit.author_email).to.be('skribki@localhost');
      expect(commit.message.startsWith('Initial Commit')).to.be(true);

      next();
    }).catch(assert.ifError).done();
  });

};
