'use strict'

exports.install = () => {
  F.route('/special/error/{errno}', function (errno) { this.viewError(errno, '/') })
  F.route('/special/random', displayRandom)
  F.route('/special/search', displaySearch)

  // commit stuff
  F.route('/special/commit/{commit}', showCommit)

  // a few easter-egg routes
  F.route('/special/ashley', function () { this.view707() })
  F.route('/special/brew', function () { this.view418() })

  F.route('/special/parsers', parseBody, [ 'post' ])
}

function displayRandom () {
  this.throw501('random not yet implemented')
}

function displaySearch () {
  this.throw501('search not yet implemented')
}

function showCommit () {
  this.throw501('commit viewing not yet implemented')
}

function parseBody () {
  F.model('page').parseDocument(this.body.body).then((res) => {
    this.res.send(200, res.body, 'text/html')
  }).catch(err => { this.throw500(err) }).done()
}
