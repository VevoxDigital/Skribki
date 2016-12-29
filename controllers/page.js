'use strict';

const MODEL = 'page';

exports.install = () => {
  F.route(r => { return !F.locked(r); }, routePage);
};

function routePage() {
  let page = F.model('page');
  page.read(this.url).then(page.parseDocument).then(doc => {
    this.repository.title = doc.header.title;
    this.view('page', { page: doc });
  }).catch(this.response500).done();
}
