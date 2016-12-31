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
    default:
      page.read(this.url).then(page.parseDocument).then(doc => {
        this.repository.title = doc.header.title;
        this.view('page', { page: doc });
      }).catch(this.response500).done();
      break;
  }
}
