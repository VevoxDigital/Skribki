'use strict';

const MODEL = 'page';

exports.install = () => {
  F.route(r => { return !F.locked(r); }, routePage);
  F.route(r => { return !F.locked(r); }, editPage, [ 'post' ]);
};

// TODO Fix and use `response500` instead of `response500`

function routePage() {
  let page = F.model('page');
  switch (this.query.a || '') {
    case 'history':
      page.history(this.url).then(history => {
        this.repository.title = 'History of ' + this.url;
        this.view('history', { history: history });
      }).catch(this.response500).done();
      break;
    case 'edit':
      if (!this.user) return this.redirect(this.url);
      page.read(this.url).then(data => {
        this.repository.title = F.localize(this.req, 'title.page.edit');
        this.view('edit', { data: data });
      }).catch(this.response500).done();
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
      }).catch(this.response500).done();
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
  }).catch(this.response500).done();
}
