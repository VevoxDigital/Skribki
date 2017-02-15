'use strict'

const assert = require('assert')
const expect = require('expect.js')

exports.run = () => {
  F.assert('module:utils.normalize', next => {
    expect(U.normalize('foo/')).to.be('/foo')
    expect(U.normalize('../foo/bar')).to.be('/foo/bar')
    expect(U.normalize('/')).to.be('/')
    expect(U.normalize()).to.be('/')
    next()
  })

  F.assert('module:utils.locked', next => {
    expect(U.lockedPatterns).to.be.an('array')

    expect(U.locked('/special/foo')).to.be(true)
    expect(U.locked('/category/bar')).to.be(true)
    expect(U.locked('/.git')).to.be(true)
    expect(U.locked('/foo/bar')).to.be(false)

    next()
  })

  F.assert('module:utils.checkEmail', next => {
    // by default, we allow 'user@example.com' and anything @ 'localhost' and the whitelist is on
    expect(U.checkEmail('user@example.com')).to.be(true)
    expect(U.checkEmail('USER@example.com')).to.be(false) // case sensitive
    expect(U.checkEmail('postmaster@localhost')).to.be(true)
    expect(U.checkEmail('user@example2.com')).to.be(false)

    next()
  })

  F.assert('module:utils.localize', next => {
    expect(U.localize('en-us', 'lang.name')).to.be('English')
    expect(U.localize('en-us', 'error.header', 200)).to.be('Error 200')

    // should default to 'en-us' (our wiki default)
    expect(U.localize('invalid-lang', 'lang.name')).to.be('English')

    // should return the key if not found
    expect(U.localize('en-us', 'missing.key')).to.be('missing.key')
    next()
  })
}
