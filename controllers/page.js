'use strict';

const special_route = /^\/(?:special|category)\/?/i,
      page_model = 'page';

const path  = require('path'),
      fs    = require('fs-extra'),
      q     = require('q');

exports.install = function () {
  let self = this;

  F.route((url, req, flags) => {
    return !url.match(special_route);
  }, process_page, ['#navbar', '#sidebar']);

};

function process_page() {
  let self = this;

  let method = self.req.method;

  if (method === 'GET') {

    if (self.query.a === 'history') {

    } else if (self.query.a === 'delete') {

    } else F.model('page').read(self.url).then(c => {
      if (self.query.a === 'edit') {
        if (!self.user) return self.redirect(self.url);
        if (typeof c === 'array') return self.redirect(self.url);

        let model = { };
        model.isEdit = !!c;
        model.content = c ? c.body : '$title Page Title\n$desc Page Desc\n$categories []';
        model.url = self.url;

        self.repository.title = (c ? 'Editing' : 'Creating') + ' Page';
        self.repository.desc = `${c ? 'Editing' : 'Creating'} '${self.url}' as ${self.user.name || self.user.username}`;

        self.view('edit', model);
      } else {
        if (typeof c === 'array') self.view('page', { files: c, url: self.url });
        else {
          let content = c || {
            title: 'Page Not Found',
            desc: 'The page you requested was not found.',
            categories: [],
            body: `<h1>Page Does not Exist</h1>Would you like to <a href="${self.url}?a=edit">create this page</a>?`
          };

          self.repository.title = content.title.toString();
          self.repository.desc = content.desc.toString();
          self.repository.categories = content.categories;
          self.repository.toc = content.toc;

          self.view('page', { body: content.body, url: self.url });
        }
      }
    }).catch(err => F.response500(self.req, self.res, err)).done();
  } else self.res.send(`method ${method} not supported for ${self.url}`);
};
