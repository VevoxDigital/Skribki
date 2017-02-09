'use strict'

exports.install = () => {
  F.route('/special/api/{endpoint}', get)
}

/**
  * @function get(endpoint)
  * Handles a GET request to the API at the requested endpoint
  *
  * @param endpoint The requested endpoint
  * @this FrameworkController
  */
function get(endpoint) {
  switch (endpoint) {
    case 'index':
      getIndex.call(this)
      break
    default:
      this.status = 404
      this.plain(`unknown endpoint '${endpoint}'`)
  }
}

/**
  * @function getIndex()
  * Fetches the wiki index
  *
  * @this FrameworkController
  */
function getIndex() {
  F.model('page').buildIndex().then(index => {
    this.json(index)
  }).catch(this.response500).done()
}
