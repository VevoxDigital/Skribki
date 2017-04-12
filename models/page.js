'use strict'

const lockfile = require('lockfile')
const fs = require('fs-extra')
const readline = require('readline')
const klaw = require('klaw')
const path = require('path')
const q = require('q')
const _ = require('lodash')
const git = require('simple-git')
const assert = require('assert')
const stream = require('stream')
const cheerio = require('cheerio')

const INDEX_KEY = 'PAGE_INDEX'

exports.id = 'page'
exports.wikiPath = path.join(__dirname, '..', 'wiki')

exports.LOCKFILE = 'repo.lck'

/**
  * @function install
  * Syncronous install function, called once when the model is loaded.
  */
exports.install = () => {
  let deferred = q.defer()

  F.path.wiki = (p = '') => { return F.path.root(path.join(F.isTest ? 'wiki.test' : 'wiki', p)) }
  try {
    fs.mkdirSync(F.path.wiki())
  } catch (e) { /* no-op */ }
  try {
    lockfile.lockSync(F.path.wiki(exports.LOCKFILE))
  } catch (e) {
    console.error('failed to lock repository, it may be in use')
    console.error(e)
    F.kill(-1)
  }

  let repo = git(F.path.wiki())
  F.repository = repo

  try {
    if (!fs.statSync(F.path.wiki('.git')).isDirectory()) throw new Error()
  } catch (e) {
    // repo isn't initialized, need to do so.
    repo.init().addConfig('user.email', 'skribki@localhost')
      .addConfig('user.name', 'Skribki', err => {
        if (err) return deferred.reject(err)
        let data = {
          body: '$title Home\n$desc  Welcome to your new Skribki!\n' +
            fs.readFileSync(path.join(__dirname, '..', 'readme.md')).toString(),
          name: 'Skribki',
          email: 'skribki@localhost',
          message: 'Initial Commit'
        }
        deferred.resolve(exports.write('index', data))
      })
  }

  return deferred.promise
}

/**
  * @function uninstall
  * Syncronous uninstall method. Called when the model is unloading
  */
exports.uninstall = () => {
  if (F.isTest) fs.removeSync(F.path.wiki())
  lockfile.unlockSync(F.path.wiki('repo.lck'))
  delete F.path.wiki
}

/**
  * @function workingFile
  * Gets the workingFile for the given route after normalizing it
  * The working file is resolved if found, else an error is thrown
  *
  * @param route The route
  * @return Promise
  */
exports.workingFile = route => {
  route = U.normalize(route)
  if (route === '/') route = ''
  if (path.dirname(route).split(/\//g).indexOf('index') >= 0) {
    throw new Error(`'index' cannot be a directory`)
  }

  let deferred = q.defer()

  fs.stat(F.path.wiki(route), (err, stats) => {
    if (err) return err.message.startsWith('ENOENT') ? deferred.resolve(route) : deferred.reject(err)
    deferred.resolve(stats.isDirectory() ? route + '/index' : route)
  })

  return deferred.promise
}

/**
  * @function read
  * Reads the given route, returning the file or directory contents if found and
  * throwing an error if not.
  *
  * @param route The route
  * @return Promise
  */
exports.read = (route, $readAnyway) => {
  return exports.workingFile(route).then(route => {
    let deferred = q.defer()

    if (route.endsWith('/index') && !$readAnyway) {
      fs.stat(F.path.wiki(route), (err, stats) => {
        if (!err && stats.isFile()) deferred.resolve(exports.read(route, true))
        else if (err.message.startsWith('ENOENT')) {
          fs.readdir(F.path.wiki(path.dirname(route)), (err, files) => {
            if (err) return err.message.startsWith('ENOENT') ? deferred.resolve() : deferred.reject(err)
            deferred.resolve(files)
          })
        } else deferred.reject(err)
      })
    } else {
      fs.readFile(F.path.wiki(route), (err, data) => {
        if (err) return err.message.startsWith('ENOENT') ? deferred.resolve() : deferred.reject(err)
        deferred.resolve(data.toString())
      })
    }

    return deferred.promise
  })
}

/**
  * @class PageHeader
  * A page's header.
  */
exports.PageHeader = class PageHeader {
  constructor (path, headers) {
    Object.defineProperty(this, 'path', { value: path, enumerable: true })
    Object.defineProperty(this, 'headers', { value: headers, enumerable: true })
  }
}

/**
  * @function readHeader
  * Reads the header from a given Readable, returning a promise that will resolve with it.
  *
  * @param rt The route that created the Readable
  * @return Promise
  */
exports.readHeader = (route, readStream) => {
  const deferred = q.defer()

  const reader = readline.createInterface({ input: readStream })
  readStream.on('error', deferred.reject)

  let header = { }
  let finished = false
  reader.on('line', line => {
    if (finished || !line.startsWith('$')) {
      finished = true
      return
    }

    const breakIndex = line.indexOf(' ')
    if (breakIndex < 0) return

    header[line.substring(1, breakIndex)] = line.substring(breakIndex).trim()
  })
  .on('close', () => {
    deferred.resolve(new exports.PageHeader(route, header))
  })

  return deferred.promise
}

/**
  * @function readStringHeader
  * Promises to read a PageHeader from the given string
  *
  * @param route The route the string originated from
  * @return Promise
  */
exports.readStringHeader = (doc) => {
  let reader = new stream.Readable()
  reader.push(doc)
  reader.push(null)

  return exports.readHeader(undefined, reader)
}

/**
  * @function readFileHeader
  * Promises to read a PageHeader from the given file
  *
  * @param rt The route of the file
  * @return Promise
  */
exports.readFileHeader = (rt, $skipFileCheck) => {
  return ($skipFileCheck ? q(U.normalize(rt)) : exports.workfigFile(rt)).then(route => {
    return exports.readHeader(route, fs.createReadStream(F.path.wiki(route)))
  })
}

/**
  * @function makeDirs
  * Creates a promising function for the given route to create all necessary directores
  *
  * @param rt The route
  * @return Function
  */
exports.makeDirs = rt => {
  rt = U.normalize(rt)
  return q.nfcall(fs.ensureDir, F.path.wiki(path.dirname(rt))).then(() => { return rt })
}

/**
  * @function modifyFile
  * Creates a file modification lock for the given file then applies the function.
  * When the function calls its callback, the file is unlocked.
  *
  * The returning promise is resolved with the data passed into the function's
  * callback, or rejected on error.
  *
  * @param rt The route
  * @param func The function to call
  * @return Promise
  */
exports.modifyFile = (rt, func) => {
  return exports.workingFile(rt).then(exports.makeDirs).then(route => {
    let deferred = q.defer()

    // lock the file to avoid any weird commits with two simultanious edits
    // wait 2 seconds for other locks to be released
    lockfile.lock(F.path.wiki(route + '.lck'), { wait: 2000 }, err => {
      if (err) return deferred.reject(err)
      func(route, (e, v) => {
        lockfile.unlock(F.path.wiki(route + '.lck'), err => {
          if (e || err) return deferred.reject(e || err)
          deferred.resolve(v)
        })
      })
    })

    return deferred.promise
  })
}

/**
  * @function write
  * Writes the given data to the route
  *
  * @param rt The route
  * @param data The data to write
  * @return Promise
  */
exports.write = (rt, data) => {
  assert.equal(typeof data, typeof { }, 'data should be an object, got ' + typeof data)
  assert.equal(typeof data.name, 'string', 'data should have string name')
  assert.equal(typeof data.email, 'string', 'data should have string email')
  assert.equal(typeof data.body, 'string', 'data should have string body')
  data.body = data.body.replace(/\r(?:\n)?/g, '\n')

  return exports.modifyFile(rt, (route, done) => {
    fs.writeFile(F.path.wiki(route), data.body, err => {
      if (err) return done(err)
      data.message = U.escape(data.message || 'Update ' + route)
      F.repository.add('.' + route)
        .commit(data.message, { '--author': `"${data.name} <${data.email}>"` }, done)
    })
  })
}

/**
  * @function removeIfEmpty
  * Removes the given route's directory if its empty. The promise is always resolved
  * with no data unless there is an error
  *
  * @param route
  * @return Promise
  */
exports.removeIfEmpty = route => {
  return q.nfcall(fs.readdir, F.path.wiki(route)).then(files => {
    if (files.length === 0) {
      return q.nfcall(fs.rmdir, F.path.wiki(route))
        .then(exports.removeIfEmpty(path.dirname(route)))
    }
  })
}

/**
  * @function delete
  * Deletes the page at the given route and commits the deletion
  *
  * @param rt The route
  * @param data The commit data.
  * @return Promise
  */
exports.delete = (rt, data = { }) => {
  assert.equal(typeof data, typeof { }, 'data should be an object, got ' + typeof data)
  assert.equal(typeof data.name, 'string', 'data should have string name')
  assert.equal(typeof data.email, 'string', 'data should have string email')

  return exports.modifyFile(rt, (route, done) => {
    fs.unlink(F.path.wiki(route), err => {
      if (err) return done(err)
      data.message = U.escape(data.message || 'Delete ' + route)
      F.repository.add('.' + route)
        .commit(data.message, { '--author': `"${data.name} <${data.email}>"` }, (err) => {
          if (err) done(err)
          else done(null, exports.removeIfEmpty(path.dirname(route)))
        })
    })
  })
}

/**
  * @function parseDocument
  * Parses the given string as a page document, returning the resulting parsed data in a promise
  *
  * @param doc The document to parse
  * @return Promise
  */
exports.parseDocument = doc => {
  if (typeof doc === 'string') {
    let bodyMatch = /(?:^|\n)[^$]/.exec(doc)
    if (!bodyMatch) return q('')
    let body = doc.substring(bodyMatch.index)

    return exports.readStringHeader(doc).then(header => {
      return { header: header, toc: [], body: body }
    }).then(result => { return exports.parse(result) }).then(result => {
      const $ = cheerio.load(result.body)

      $('h1, h2, h3').each(function () {
        const element = $(this)

        result.toc.push({
          level: parseInt(element.prop('tagName').substring(1), 10),
          id: element.attr('id'),
          content: element.html()
        })
        element.append(`<a href="#${element.attr('id')}" class="fa fa-link"></a>`)
      })

      result.body = $.html()
      return result
    })
  } else if (doc instanceof Array) {
    let data = { }

    for (const file of doc) {
      let name = path.basename(file)
      let letter = name.substring(0, 1).toUpperCase()
      data[letter] = data[letter] || []
      data[letter].push(name)
    }

    return q(data)
  } else return q()
}

/**
  * @function parse
  * Executes all loaded parsers on the given string, returning the resulting html in a promise
  *
  * @param doc The document to parse
  * @return Promise
  */
exports.parse = doc => {
  assert.equal(typeof doc.body, 'string', 'body should be a string')
  let deferred = q.defer()

  fs.readdir(F.path.models('parsers'), (err, files) => {
    if (err) deferred.reject(err)

    let docPromise = q(doc)
    for (const file of files) docPromise = docPromise.then(require(F.path.models('parsers/' + file)).run); // eslint-disable-line
    deferred.resolve(docPromise)
  })

  return deferred.promise
}

/**
  * @function history
  * Gets the history for the given route
  *
  * @param rt The route
  * @return Promise
  */
exports.history = rt => {
  assert.equal(typeof rt, 'string', 'route must be a string')
  let deferred = q.defer()

  exports.workingFile(rt).then((route = U.normalize(rt)) => {
    F.repository.log(['--', route.substring(1)], (err, results) => {
      if (err) deferred.reject(err)
      deferred.resolve(results.all)
    })
  })

  return deferred.promise
}

/**
  * @function buildIndex
  * Builds the wiki index, cacheing it for `cache.index.time`
  *
  * @return Promise A promise with the index
  */
exports.buildIndex = () => {
  const cached = F.cache.get(INDEX_KEY)
  if (!F.isDebug && cached) return q(cached)

  const deferred = q.defer()

  function replacePath (route) {
    return U.normalize(route).substring(1).replace(new RegExp(`\\${path.sep}`, 'g'), '.')
  }

  let indexList = [ ]
  let index = { }
  klaw(F.path.wiki())
    .on('data', item => {
      if (item.stats.isDirectory() || item.stats.isFile()) {
        indexList.push({ path: item.path, isFile: item.stats.isFile() })
      }
    })
    .on('end', () => {
      const startIndex = indexList[0].path.length
      indexList.shift() // ignore the first entry after we recorded its length

      let indexPromises = [ ]
      _.each(indexList, item => {
        item.path = item.path.substring(startIndex)
        if (U.locked(U.normalize(item.path))) return

        if (item.isFile) indexPromises.push(exports.readFileHeader(item.path, true))
        else _.set(index, replacePath(item.path), { })
      })

      deferred.resolve(q.allSettled(indexPromises).then(results => {
        _.each(results, result => {
          if (result.state !== 'fulfilled') return F.logger.warn(result.value)
          result = result.value

          _.set(index, replacePath(result.path.substring(1)), result)
        })

        if (F.config['cache.index.enabled']) F.cache.set(INDEX_KEY, index, F.config['cache.index.time'] || '10 minutes')
        return index
      }))
    })

  return deferred.promise
}

/**
  * @function searchIndex
  * Searches the wiki index for a specified keyword (case in-sensitive). If the specified
  * keyword is found within the path, title, or description, the path is added to the results.
  *
  * The result is an object with two arrays: dirs (strings) and pages (PageHeaders)
  *
  * @return Promise A promise to search the index
  */
exports.searchIndex = keyword => {
  let results = { dirs: [ ], pages: [ ] }

  function keywordMatch (key) {
    if (!key) return false
    return key.toLowerCase().contains(keyword.toLowerCase())
  }

  function search (index) {
    _.each(index, (val, key) => {
      if (val instanceof exports.PageHeader) {
        if (keywordMatch(val.headers.title) || keywordMatch(val.headers.desc) ||
          keywordMatch(key)) results.pages.push(val)
      } else {
        if (keywordMatch(key)) results.dirs.push(key)
        search(val)
      }
    })
  }

  return exports.buildIndex().then(index => {
    search(index)
    return results
  })
}

/**
  * @function pageList
  * Flattens the wiki index, creating a list of PageHeaders and strings (directories)
  *
  * @return Promise A promise to flatten the index
  */
exports.pageList = () => {
  let flatMap = []

  function flatten (index) {
    _.each(index, (val, key) => {
      if (val instanceof exports.PageHeader) flatMap.push(val)
      else {
        flatMap.push(key)
        flatten(val)
      }
    })
  }

  return exports.buildIndex().then(index => {
    flatten(index)
    return flatMap
  })
}

/**
  * @function random
  * Selects a pseudo-random page from the @{function pageList} and returns it, either
  * a PageHeader or string path (in the event of a directory)
  *
  * @return Promise A promise to select a random page
  */
exports.random = () => {
  return exports.pageList().then(list => {
    return list[Math.floor(Math.random() * list.length)]
  })
}
