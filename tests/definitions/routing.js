'use strict';

const assert = require('assert'),
      expect = require('expect.js');

exports.run = () => {

  F.assert('definition:routing#locked', next => {
    expect(F.lockedPatterns).to.be.an('array');

    expect(F.locked('/special/foo')).to.be(true);
    expect(F.locked('/category/bar')).to.be(true);
    expect(F.locked('/.git')).to.be(true);
    expect(F.locked('/foo/bar')).to.be(false);
    next();
  });

  F.assert('definition:Controller.prototype#viewError', next => {
    let code = 707, url = '/foo', info = 'foobar';
    let context = {
      repository: { },
      req: { },
      view: (view, model) => {
        expect(view).to.be('error');

        expect(model.errno).to.be(code);
        expect(model.url).to.be(url);
        expect(model.info).to.be(info);
        next();
      }
    };
    Controller.prototype.viewError.call(context, code, url, info);
  });

};
