'use strict';

const assert = require('assert'),
      expect = require('expect.js');

exports.run = () => {

  F.assert('module:utils.normalize', next => {
    expect(Utils.normalize('foo/')).to.be('/foo');
    expect(Utils.normalize('../foo/bar')).to.be('/foo/bar');
    expect(Utils.normalize('/')).to.be('/');
    expect(Utils.normalize()).to.be('/');
    next();
  });

  F.assert('module:utils.locked', next => {
    expect(Utils.lockedPatterns).to.be.an('array');

    expect(Utils.locked('/special/foo')).to.be(true);
    expect(Utils.locked('/category/bar')).to.be(true);
    expect(Utils.locked('/.git')).to.be(true);
    expect(Utils.locked('/foo/bar')).to.be(false);

    next();
  });

  F.assert('module:utils.checkEmail', next => {
    // by default, we allow 'user@example.com' and anything @ 'localhost' and the whitelist is on
    expect(Utils.checkEmail('user@example.com')).to.be(true);
    expect(Utils.checkEmail('USER@example.com')).to.be(false); // case sensitive
    expect(Utils.checkEmail('postmaster@localhost')).to.be(true);
    expect(Utils.checkEmail('user@example2.com')).to.be(false);

    next();
  });

  F.assert('module:utils.localize', next => {
    expect(Utils.localize('en-us', 'lang.name')).to.be('English');
    expect(Utils.localize('en-us', 'error.header', 200)).to.be('Error 200');

    // should default to 'en-us' (our wiki default)
    expect(Utils.localize('invalid-lang', 'lang.name')).to.be('English');

    // should return the key if not found
    expect(Utils.localize('en-us', 'missing.key')).to.be('missing.key');
    next();
  });

}
