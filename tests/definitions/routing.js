'use strict';

const assert = require('assert');

exports.run = () => {

  F.assert('definition:routing:locked', (next, name) => {
    assert.ok(F.lockedPatterns, 'locked patterns are missing');
    assert.ok(F.locked('/special/foo'), 'special paths should lock');
    assert.ok(F.locked('/category/bar'), 'categories should lock');
    assert.ok(!F.locked('/foo/bar'), 'all others should not lock');
    next();
  });

};
