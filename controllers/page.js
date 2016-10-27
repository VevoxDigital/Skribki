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
  }, process_page);

  F.route((url, req, flags) => {
    return url.match(special_route);
  }, process_special);

};

function process_page() {
  let self = this;

  let method = self.req.method;

  if (method === 'GET') {

    F.model('page').read(self.url, (err, c) => {
      if (err) return res.status(500).send(err.stack); // TODO Better error handling.

      let content = c || {
        title: 'Page Not Found',
        desc: 'The page you requested has not been created.',
        categories: [],
        body: `# Page Does not Exist\nWould you like to [create this page](${self.url}?create)?`
      };

      self.repository.title = content.title.toString();
      self.repository.desc = content.desc.toString();
      self.repository.categories = content.categories;

      if (content.body) {
        // Is page
        const parsersDir = path.join(__dirname, '..', 'extensions', 'parsers');

        // TODO Cache parsed files.
        let parsers = [];
        fs.walk(parsersDir)
          .on('data', item => {
            if (item.stats.isFile() && path.extname(item.path) === '.js')
              parsers.push(require(item.path));
          }).on('end', () => {

            let i = 0, pi, doc = q.fcall(() => {

              self.repository.toc = [];

              let headerPattern = /<h([123])[^>]*>(.+)<\/h[123]>/igm, m;
              while (m = headerPattern.exec(content.body)) {
                self.repository.toc.push({
                  tagS: '<h' + m[1] + '>',
                  tagE: '</h' + m[1] + '>',
                  title: m[2],
                  hash: m[2].toLowerCase().replace(/[^a-z0-9]/ig, '-')
                });
                pi = headerPattern.lastIndex;
              }

              return content.body.substring(pi + 1);
            });

            //parsers.forEach(p => {
              //doc = doc.then(require(parsersDir + '/90-markdown.js'))
            //});
            parsers.reduce((cur, next) => { return cur.then(next); }, q(doc)).then((body) => {
              self.view('page', { body: body });
            }).catch(err => {
              self.throw500(err);
            }).done();

          });
      }
      else {
        // Is dir
        self.res.send('is dir ' + content.title + ' ' + content.desc + '<br>' + self.url);
      }
    });

  } else self.res.send(`method ${method} not supported for ${self.url}`);

  //this.view('index');
};

function process_special() {
  self.view('page', { body: 'special page' }); // TODO
};
