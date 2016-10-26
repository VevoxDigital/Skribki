'use strict';

const special_route = /^\/special\/?/i,
      page_model = 'page';

exports.install = function () {
  let self = this;

  F.route((url, req, flags) => {
    return !url.match(special_route);
  }, process_page);

  F.route((url, req, flags) => {
    return url.match(special_route);
  }, process_special);

};

function process_page() {
  let self = this;

  let method = self.req.method;

  if (method === 'GET') {

    self.repository.title = 'Page title';
    self.view('page', { content: 'Page: ' + self.url });

  } else self.res.send(`method ${method} not supported for ${self.url}`);

  //this.view('index');
};

function process_special() {

};
