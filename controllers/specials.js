'use strict'

exports.install = () => {
  F.route('/special/random', viewRandom)
  F.route('/special/search', viewSearch)
  F.route('/special/search', fetchSearchData, [ 'post' ])
}

/**
  * @function viewRandom
  * Redirects the incoming request to a random page on this wiki's index
  *
  * @this FrameworkController
  */
function viewRandom () {
  F.model('page').random().then(route => {
    this.redirect(typeof route === 'string' ? route : route.path)
  }).catch(err => { this.view500(err) }).done()
}

/**
  * @function viewSearch
  * Renders the search view to the user
  *
  * @this FrameworkController
  */
function viewSearch () {
  this.view('search')
}

/**
  * @function fetchSearchData
  * Fetches the search data and renders it as JSON
  *
  * @this FrameworkController
  */
function fetchSearchData () {
  console.log('searchData')
  F.model('page').searchIndex(this.body.query).then(results => {
    this.json(results)
  }).catch(err => { F.response500(this.req, this.res, err) }).done()
}
