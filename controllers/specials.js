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
  this.view501('search not yet implemented')
}

/**
  * @function fetchSearchData
  * Fetches the search data and renders it as JSON
  *
  * @this FrameworkController
  */
function fetchSearchData () {
  F.model('page').searchIndex().then(results => {
    this.json(results)
  }).catch(err => { this.response500(err) }).done()
}
