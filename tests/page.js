'use strict';

exports.run = () => {

  F.assert('General Page - Read', '/', ['get'], (error, data, code, headers, cookies, name) => {
    assert.ok(code === 200 && data.startsWith('<!DOCTYPE html>'));
  });

};
