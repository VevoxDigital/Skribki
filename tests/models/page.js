'use strict'

const assert = require('assert')
const expect = require('expect.js')
const fs = require('fs-extra')
const q = require('q')

exports.run = () => {
  const page = F.model('page')

  // ensure a clean install succeeded
  F.assert('model:page#install', done => {
    expect(F.path.wiki).to.be.a('function')
    expect(F.repository).to.be.an('object')

    // ensure the lockfile is present
    expect(fs.statSync)
      .withArgs(F.path.wiki(page.LOCKFILE))
      .to.not.throwException()
    expect(fs.statSync(F.path.wiki('repo.lck')).isFile()).to.be(true)

    // ensure the git repo was initialized
    expect(fs.statSync)
      .withArgs(F.path.wiki('.git'))
      .to.not.throwException()
    expect(fs.statSync(F.path.wiki('.git')).isDirectory()).to.be(true)
    done()
  })

  F.assert('model:page#workingFile', done => {
    const filename = '/working-file-'

    // write test files
    fs.mkdirSync(F.path.wiki(filename + 1))
    fs.writeFileSync(F.path.wiki(filename + '1/index'), '')
    fs.mkdirSync(F.path.wiki(filename + 2))
    fs.writeFileSync(F.path.wiki(filename + '2/page'), '')

    // test files
    q.all([
      page.workingFile(filename + 1),         // index exists
      page.workingFile(filename + 2),         // index does not exist
      page.workingFile(filename + '2/page'),  // existing page
      page.workingFile(filename + 3)          // non-existing page
    ]).then(results => {
      expect(results[0]).to.be(filename + '1/index') // should add index tail
      expect(results[1]).to.be(filename + '2/index') // should add index tail
      expect(results[2]).to.be(filename + '2/page')  // should keep path as is
      expect(results[3]).to.be(filename + 3)         // should keep path as is
      done()
    }).catch(assert.ifError).done()
  })

  F.assert('model:page#read', done => {
    const filename = '/read-'

    // write test files
    fs.writeFileSync(F.path.wiki(filename + 1), 'text')
    fs.mkdirSync(F.path.wiki(filename + 2))
    fs.writeFileSync(F.path.wiki(filename + '2/page'))

    // test files
    q.all([
      page.read(filename + 1), // existing file read
      page.read(filename + 2), // index-less directory read
      page.read(filename + 3)  // non-existing file read
    ]).then(results => {
      expect(results[0]).to.be('text')     // should read file
      expect(results[1][0]).to.be('page')  // should list directory files
      expect(results[1]).to.have.length(1) //
      expect(results[2]).to.be(undefined)  // should be undefined
      done()
    }).catch(assert.ifError).done()
  })

  // TODO #readHeader
  // TODO #readStringHeader

  F.assert('model:page#readFileHeader', done => {
    fs.writeFileSync(F.path.wiki('read-header-1'), '$foo1 bar1\n$foo2 bar2\ntext')
    fs.writeFileSync(F.path.wiki('read-header-2'), 'text')

    q.all([
      page.readFileHeader('read-header-1', true), // read file with header
      page.readFileHeader('read-header-2', true)  // read file without header
      // not testing missing file, as the method is called expecting the file exists
    ]).then(results => {
      expect(results[0]).to.be.a(page.PageHeader)
      expect(results[0].headers.foo1).to.be('bar1')
      expect(results[0].headers.foo2).to.be('bar2')
      expect(results[1].headers).to.be.empty()
      done()
    }).catch(assert.ifError).done()
  })

  F.assert('model:page#makeDirs', done => {
    const target = '/foo/bar'

    page.makeDirs(target + '/baz').then(route => {
      expect(fs.statSync)
        .withArgs(F.path.wiki(target))
        .to.not.throwException()
      expect(fs.statSync(F.path.wiki(target)).isDirectory).to.be.ok()

      done()
    }).catch(assert.ifError).done()
  })

  F.assert('model:page#modifyFile', done => {
    const target = '/modify-file'

    page.modifyFile(target, (rt, cb) => {
      expect(fs.statSync)
        .withArgs(F.path.wiki(target + '.lck'))
        .to.not.throwException()

      fs.writeFileSync(F.path.wiki(target), 'text')

      cb()
    }).then(() => {
      expect(fs.statSync)
        .withArgs(F.path.wiki(target))
        .to.not.throwException()
      expect(fs.statSync)
        .withArgs(F.path.wiki(target + '.lck'))
        .to.throwException(/^ENOENT/)

      expect(fs.readFileSync(F.path.wiki(target)).toString()).to.be('text')
      done()
    }).catch(assert.ifError).done()
  })

  F.assert('model:page#write', done => {
    const target = '/write'

    page.write(target, {
      name: 'Skribki',
      email: 'skribki@localhost',
      body: 'text'
    }).then(() => {
      expect(fs.statSync)
        .withArgs(F.path.wiki(target))
        .to.not.throwException()
      expect(fs.readFileSync(F.path.wiki(target)).toString()).to.be('text')

      // TODO Test the commit
      done()
    }).catch(assert.ifError).done()
  })

  F.assert('model:page#delete', done => {
    const target = '/delete'

    fs.writeFileSync(F.path.wiki(target), 'text')

    page.delete('/', {
      name: 'Skribki',
      email: 'skribki@localhost'
    }).then(() => {
      expect(fs.statSync)
        .withArgs(F.path.wiki('index'))
        .to.throwException(/^ENOENT/)

      // TODO Test the commit
      done()
    }).catch(assert.ifError).done()
  })

  // also tests parse method, as it really only serves this one
  F.assert('model:page#parseDocument', done => {
    page.parseDocument('$title foo\n$desc bar\n\n*body*').then(res => {
      expect(res.header).to.be.a(page.PageHeader)
      expect(res.header.path).to.be(undefined)

      expect(res.header.headers.title).to.be('foo')
      expect(res.header.headers.desc).to.be('bar')

      // no need to test parsing, should be handled in parser testing
      expect(res.body).to.be('<p><em>body</em></p>\n')
      done()
    }).catch(assert.ifError).done()
  })

  F.assert('model:page#history', done => {
    // we're assuming the first commit created in 'exports.install' will be there.
    page.history('/').then(history => {
      expect(history).to.be.an('array')

      let commit = history[history.length - 1]
      expect(commit.author_name).to.be('Skribki')
      expect(commit.author_email).to.be('skribki@localhost')
      expect(commit.message.startsWith('Initial Commit')).to.be(true)

      done()
    }).catch(assert.ifError).done()
  })

  F.assert('model:page#buildIndex', done => {
    // since all the other tests ran first, we're going to work off those files
    page.buildIndex().then(index => {
      expect(index.foo).to.be.an('object')
      expect(index.foo.bar).to.be.an('object')
      expect(index.foo.bar).to.be.empty()

      expect(index['read-header-1']).to.be.a(page.PageHeader)
      expect(index['read-header-1'].headers.foo1).to.be('bar1')

      done()
    }).catch(assert.ifError).done()
  })

  F.assert('model:page#searchIndex', done => {
    page.searchIndex('read').then(results => {
      expect(results.pages).to.have.length(3)
      expect(results.dirs).to.have.length(1)

      done()
    }).catch(assert.ifError).done()
  })

  F.assert('model:page#pageList', done => {
    page.pageList().then(list => {
      expect(list).to.be.an('array')
      expect(list[0]).to.be.a('string')
      expect(list[5]).to.be.a(page.PageHeader)

      done()
    }).catch(assert.ifError).done()
  })

  F.assert('model:page#random', done => {
    page.random().then(page => {
      expect(page).to.be.ok()

      done()
    }).catch(assert.ifError).done()
  })
}
