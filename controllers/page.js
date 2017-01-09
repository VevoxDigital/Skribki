'use strict';

const MODEL = 'page';

exports.install = () => {
  F.route(r => { return !F.locked(r); }, routePage);
};

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
      // TODO Ensure user is logged in
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
