'use strict';

const MODEL_PAGE = 'page';

// install into framework
exports.install = function () {
  F.route((url) => {
    return !F.locked(url);
  }, processPage, ['#navbar', '#sidebar']);
};

// process the displaying of the page.
function processPage() {
  let self = this, method = self.req.method;

  // if getting, switch query.a
  if (method === 'GET') switch(self.query.a) {
      case 'history':
        // TODO Page history
        self.view('page', { body: 'TODO history' });
        break;
      case 'edit':
        // editing the page
        F.model(MODEL_PAGE).readRaw(self.url).then(c => { processPageContentEdit(self, c); })
          .catch(err => F.response500(self.req, self.res, err)).done();
        break;
      default:
        // Just show the page normally
        F.model(MODEL_PAGE).read(self.url).then((c) => { processPageContent(self, c); })
          .catch(err => F.response500(self.req, self.res, err)).done();
  } else self.res.send(`method ${method} not supported for ${self.url}`);
}

function processPageContentEdit(self, c) {
  if (!self.user) return self.redirect(self.url);
  if (typeof c === 'object') return self.redirect(self.url + '/home?a=edit');

  let model = { };
  model.isEdit = true;
  model.content = c || '$title Page Title\n$desc Page Desc\n$categories []';

  let editing = c ? 'Editing' : 'Creating';
  self.repository.title = editing + ' Page';
  self.repository.desc = `${editing} '${self.url}' as ${self.user.name || self.user.username}`;

  self.view('edit', model);
}

function processPageContent(self, c) {
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

  self.view('page', { body: content.body });
}
