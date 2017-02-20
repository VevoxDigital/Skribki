'use strict'

const MODEL = 'page'

let PAGE

exports.install = () => {
  F.route(r => { return !U.locked(r) }, routeView)
  F.route(r => { return !U.locked(r) }, editPage, [ 'post' ])
  F.route(r => { return !U.locked(r) }, deletePage, [ 'delete' ])

  PAGE = F.model(MODEL)
}

/**
  * @function routeViewHistory
  * routes the 'history' view
  *
  * @this FrameworkController
  */
function routeViewHistory () {
  PAGE.history(this.url).then(history => {
    this.repository.title = 'History of ' + this.url
    this.view('history', { history: history })
  }).catch(err => { this.throw500(err) }).done()
}

/**
  * @function routeViewDelete
  * routes the 'delete' view
  *
  * @this FrameworkController
  */
function routeViewDelete () {
  if (!this.user) return this.redirect(this.url)
  this.repository.title = U.localize(this.req, 'title.page.delete')

  this.view('delete')
}

/**
  * @function routeViewEdit
  * routes the 'edit' view
  *
  * @this FrameworkController
  */
function routeViewEdit () {
  if (!this.user) return this.redirect(this.url)

  PAGE.read(this.url).then(data => {
    this.repository.title = U.localize(this.req, 'title.page.edit')
    this.view('edit', { data: data, canUseDir: !data })
  }).catch(err => { this.throw500(err) }).done()
}

/**
  * @function routeViewPage
  * routes the 'page' view
  *
  * @this FrameworkController
  */
function routeViewPage () {
  PAGE.read(this.url).then(PAGE.parseDocument).then(doc => {
    if (!doc) {
      this.repository.title = 'Not Found'
      this.viewError(404)
    } else if (!doc.header) {
      this.repository.title = 'Viewing Directory'
      this.view('directory', { files: doc })
    } else if (doc.header.redirect) {
      this.redirect(doc.header.redirect)
    } else {
      this.repository.title = doc.header.title
      this.view('page', { page: doc })
    }
  }).catch(err => { this.throw500(err) }).done()
}

/**
  * @function routeView
  * Decides which routing function to delegate to the router
  *
  * @this FrameworkController
  */
function routeView () {
  switch (this.query.a) {
    case 'history': return routeViewHistory.call(this)
    case 'delete': return routeViewDelete.call(this)
    case 'edit': return routeViewEdit.call(this)
    default: return routeViewPage.call(this)
  }
}

/**
  * @function editPage
  * Routes an edit to the model, redirecting when complete
  *
  * @this FrameworkController
  */
function editPage () {
  if (!this.user) return this.throw401('must be logged in')
  if (!this.body.body) return this.throw400('must have a body')

  PAGE.write(this.url + (this.body.useDir ? 'index' : ''), {
    email: this.user.email,
    name: this.user.name,
    body: this.body.body,
    message: this.body.message
  }).then(() => {
    this.redirect(this.url)
  }).catch(err => { this.throw500(err) }).done()
}

/**
  * @function deletePage
  * Routes a delete to the model, redirecting when complete
  *
  * @this FrameworkController
  */
function deletePage () {
  if (!this.user) return this.throw401('must be logged in')

  PAGE.delete(this.url, {
    name: this.user.name,
    email: this.user.email,
    message: this.body.message
  }).then(() => {
    this.plain('')
  }).catch(err => { this.throw500(err) }).done()
}
