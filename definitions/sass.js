'use strict';

const sass  = require('node-sass'),
      fs    = require('fs');

F.accept('scss', 'text/css');

// create a scss helper for scss files
F.helpers.scss = name => {
  return '<link type="text/css" rel="stylesheet" href="' + F.routeStyle(name).replace(/\.css$/, '') + '" />';
};

// when a SCSS file is requested
F.file('*.scss', (req, res, is) => {
  if (is) return req.extension === 'scss';

  F.exists(req, res, 20, (next, tmp) => {

    let filename = F.path.public(req.url);
    fs.readFile(filename, (err, data) => {
      if (err) return res.throw404();

      let content = F.onCompileStyle(filename, data.toString('utf8'));
      if (!F.isDebug) fs.writeFile(tmp, content);

      F.responseContent(req, res, 200, content, 'text/css', true);
    });
  });
});

// style compilation should be down with 'node-sass'
F.onCompileStyle = (filename, content) => {
  return sass.renderSync({ file: filename, data: content, outputStyle: 'compressed' }).css.toString('utf8');
};
