'use strict';

exports.run = () => {

  F.assert('Page: View', '/', ['get'], (error, data, code, headers, cookies, name) => {
    assert.ok(code === 200 && data.startsWith('<!DOCTYPE html>'), name);
  });

};
