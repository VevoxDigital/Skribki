'use strict';

const MODEL = 'page';

exports.install = () => {
  F.route(r => { return !F.locked(r); }, routePage);
  F.route(r => { return !F.locked(r); }, editPage, [ 'post' ]);
  F.route(r => { return !F.locked(r); }, deletePage, [ 'delete' ]);
};

/* eslint complexity: ["error", 7] */
function routePage() {
  let page = F.model('page');
  switch (this.query.a || '') {
    case 'history':
      page.history(this.url).then(history => {
        this.repository.title = 'History of ' + this.url;
        this.view('history', { history: history });
      }).catch(this.response500).done();
      break;
    case 'delete':
      if (!this.user) return this.redirect(this.url);
      this.repository.title = F.localize(this.req, 'title.page.delete');
      this.view('delete');
      break;
    case 'edit':
      if (!this.user) return this.redirect(this.url);
      page.read(this.url).then(data => {
        this.repository.title = F.localize(this.req, 'title.page.edit');
        this.view('edit', { data: data });
      }).catch(err => { this.throw500(err); }).done();
      break;
    default:
      page.read(this.url).then(page.parseDocument).then(doc => {
        if (!doc) {
          this.repository.title = 'Not Found';
          this.viewError(404);
        } else {
          this.repository.title = doc.header.title;
          this.view('page', { page: doc });
        }
      }).catch(err => { this.throw500(err); }).done();
      break;
  }
}

function editPage() {
  if (!this.user) return this.throw401('must be logged in');
  if (!this.body.body) return this.throw400('must have a body');

  F.model('page').write(this.url, {
    email: this.user.email,
    name: this.user.name,
    body: this.body.body,
    message: this.body.message
  }).then(() => {
    this.redirect(this.url);
  }).catch(err => { this.throw500(err); }).done();
}

function deletePage() {
  if (!this.user) return this.throw401('must be logged in');

  F.model('page').delete(this.url, {
    name: this.user.name,
    email: this.user.email,
    message: this.body.message
  }).then(() => {
    this.redirect(this.url);
  }).catch(err => { this.throw500(err); }).done();
}
