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
        require('simple-git')(F.path.wiki()).reset(['HEAD^1', '--hard'], next);
      });
    }).catch(assert.ifError).done();
  });

};