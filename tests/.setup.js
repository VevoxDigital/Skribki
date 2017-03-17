'use strict'

/*
 * TotalJS will execute files in order, always preferring real files over directories.
 * So, we're going to utilize that to set up the environment for testing.
 *
 * We'll initialize 'mock-fs' so we can test actions on the wiki fluidly without
 * those nasty errors travis keeps throwing.
 */

const mock = require('mock-fs')
const expect = require('expect.js') // no, we do *not* need the entirerity of chai

const fs = require('fs')

exports.run = () => {
  F.assert('@before', done => {
    const indexContent = 'Text Index Content'

    // load up mock-fs
    // we can completely hide the file system, as TotalJS *should* already have it.
    mock({
      'wiki': {
        index: indexContent
      }
    })

    // just make sure our file system has actually been overridden properly.
    expect(() => { fs.statSync(F.path.definitions()) }).to.throwException(/^ENOENT/)
    expect(fs.readFileSync(F.path.wiki('index')).toString()).to.be(indexContent)

    console.log('') // just log a new line for asthetic purposes
    done()
  })
}
