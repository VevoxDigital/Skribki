'use strict';

const cheerio = require('cheerio');

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

  let page = F.model(MODEL_PAGE);

  // if getting, switch query.a
  if (method === 'GET') switch(self.query.a) {
      case 'history':
        // viewing history
        page = page.history(self.url).then(history => { exports.processHistory(self, history); });
        break;
      case 'edit':
        // editing the page
        page = page.readRaw(self.url).then(c => { exports.processPageContentEdit(self, c); });
        break;
      default:
        // Just show the page normally
        page = page.read(self.url).then((c) => { exports.processPageContent(self, c); });
  } else self.res.send(`method ${method} not supported for ${self.url}`);

  page.catch(err => F.response500(self.req, self.res, err)).done();
}

exports.processPageContentEdit = (self, c) => {
  if (!self.user) return self.redirect(self.url);
  if (typeof c === 'object') return self.redirect(self.url + '/home?a=edit');

  let model = { };
  model.isEdit = true;
  model.content = c || '$title Page Title\n$desc Page Desc\n$categories []\n\nHello World';

  let editing = c ? 'Editing' : 'Creating';
  self.repository.title = editing + ' Page';
  self.repository.desc = `${editing} '${self.url}' as ${self.user.name || self.user.username}`;

  self.view('edit', model);
}

exports.processPageContent = (self, c) => {
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

exports.processHistory = (self, history) => {
  self.repository.title = 'Page History';
  self.repository.desc = 'Viewing history for \'' + self.url + '\'';

  // view all diffs for this page
  const pageNum = self.query.page ? parseInt(self.query.page, 10) - 1 : 0,
        perPage = 30, pages = Math.ceil(history.length / perPage),
        pagedHistory = history.slice(pageNum * perPage, (pageNum + 1) * perPage);

  self.view('page', {
    history: pagedHistory,
    page: pageNum + 1,
    pages: pages,
    commits: history.length,
    hideOptions: true
  });
};
