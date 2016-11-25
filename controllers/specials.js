'use strict';

exports.install = () => {
  F.route('/special/commits/{hash}', processCommit, ['#navbar', '#sidebar']);
};

function processCommit(hash) {
  let self = this;

  if (!hash) return self.throw400('Hash not provided');


  F.model('page').history(hash).then(commit => {
    self.view('commit', {
      hideOptions: true,
      commit: commit
    });
  }).catch(err => { self.throw500(err); }).done();
}
