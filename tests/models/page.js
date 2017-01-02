'use strict';

const assert = require('assert');

const fs    = require('fs'),
      path  = require('path');

const TEST_PATH = '/test~';

exports.run = () => {
  const page = F.model('page');

  F.assert('models:page:install', next => {
    fs.stat(F.path.wiki('repo.lck'), (err, stats) => {
      assert.ifError(err);
      assert.ok(stats.isFile(), 'repo should be locked');
      assert.ok(fs.statSync(F.path.wiki('.git')).isDirectory(), 'repo should be valid git repo');
      next();
    });
  });

  F.assert('models:page:normalizePath', next => {
    assert.equal(page.normalizePath('/foo/'), '/foo', 'should remove trailing slash');
    assert.equal(page.normalizePath('../foo/bar'), '/foo/bar', 'should prevent up-stepping');
    next();
  });

  F.assert('models:page:workingFile', next => {
    fs.mkdirSync(F.path.wiki(TEST_PATH));
    page.workingFile(TEST_PATH).then(file => {
      assert.equal(file, TEST_PATH + '/index', 'should fetch index of directory');
      fs.rmdirSync(F.path.wiki(TEST_PATH));
      return page.workingFile(TEST_PATH).then(file => {
        assert.ok(!file, 'should return empty data on missing file');
        next(); // file present condition tested in next test
      });
    }).catch(assert.ifError).done();
  });

  F.assert('models:page:read', next => {
    page.read(TEST_PATH).then((data) => {
      assert.ok(!data, 'missing file should not have data');
      fs.writeFileSync(F.path.wiki(TEST_PATH), 'foobar');
      return page.read(TEST_PATH).then((data) => {
        assert.strictEqual(data, 'foobar', 'should read file contents');
        fs.unlinkSync(F.path.wiki(TEST_PATH));
        next();
      });
    }).catch(assert.ifError).done();
  });

  F.assert('models:page:write', next => {
    page.write(TEST_PATH, {
      name: 'Test User',
      email: 'test@example.com',
      body: 'foobarbaz'
    }).then(() => {
      return page.read(TEST_PATH).then(data => {
        assert.equal(data, 'foobarbaz', 'should have written file to disk');
        F.repository.reset(['HEAD^1', '--hard'], next);
      });
    }).catch(assert.ifError).done();
  });

  F.assert('models:page:parseDocument', next => {
    page.parseDocument('$title foo\n$desc bar\n\n*body*').then(res => {
      assert.equal(res.header.title, 'foo', 'title should be from document');
      assert.equal(res.header.desc, 'bar', 'description should be from document');

      // no need to overly test parsing, should be handled in parser testing
      assert.equal(res.body, '<p><em>body</em></p>\n', 'body should have been parsed');
      next();
    }).catch(assert.ifError).done();
  });

  F.assert('models:page:parseDocumentEmpty', next => {
    page.parseDocument().then(res => {
      assert.ok(!res, 'should yield empty response');
      next();
    }).catch(assert.ifError).done();
  });

};
