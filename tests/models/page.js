'use strict';

const assert = require('assert');

const fs    = require('fs'),
      path  = require('path');

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

  F.assert('models:page:read', next => {
    let route = '/test~';
    try {
      fs.unlinkSync(F.path.wiki(route));
    } catch (e) { /* no-op */ }
    page.read(route).then((data) => {
      assert.ok(!data, 'missing file should not have data');
      fs.writeFileSync(F.path.wiki(route), 'foobar');
      page.read(route).then((data) => {
        assert.strictEqual(data, 'foobar', 'should read file contents');
        fs.unlinkSync(F.path.wiki(route));
        next();
      }).catch(assert.ifError).done();
    }).catch(assert.ifError).done();
  });

};
