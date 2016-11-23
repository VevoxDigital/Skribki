'use strict';

const MODEL_PAGE = 'page';

// Install into framework
exports.install = function () {
  F.route((url) => {
    return !F.locked(url);
  }, processPage, ['#navbar', '#sidebar']);
};

function processPage() {
  let self = this, method = self.req.method;

  if (method === 'GET') switch(self.query.a) {
      case 'history':
        // TODO Page history
        self.view('page', { body: 'TODO history', url: self.url });
        break;
      case 'delete':
        // TODO Page delete
        self.view('page', { body: 'TODO delete', url: self.url });
        break;
      default:
        F.model(MODEL_PAGE).read(self.url).then((c) => { processPageContent(self, c); })
          .catch(err => F.response500(self.req, self.res, err)).done();
  } else self.res.send(`method ${method} not supported for ${self.url}`);
}

/*eslint complexity: ["error", 7]*/
function processPageContent(self, c) {
  if (self.query.a === 'edit') {
    if (!self.user) return self.redirect(self.url);

    let model = { };
    model.isEdit = !!c;
    model.content = c ? c.body : '$title Page Title\n$desc Page Desc\n$categories []';
    model.url = self.url;

    let editing = c ? 'Editing' : 'Creating';
    self.repository.title = editing + ' Page';
    self.repository.desc = `${editing} '${self.url}' as ${self.user.name || self.user.username}`;

    self.view('edit', model);
  } else {
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
