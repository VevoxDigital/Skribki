'use strict';

const less  = require('less'),
      fs    = require('fs');

F.accept('less', 'text/css');
F.helpers.less = name => {
  return '<link type="text/css" rel="stylesheet" href="' + F.routeStyle(name).replace(/\.css$/, '') + '" />';
};

F.file('**/*.less', (req, res, is) => {
  process.exit(0);
  //if (is) return req.extension === 'less';

  F.exists(req, res, 20, (next, tmp) => {

    let filename = F.path.public(req.url);
    fs.readFile(filename, (err, data) => {

      if (err) {
        next();
        res.throw404();
        return;
      }

      F.responseContent(req, res, 200, 'body { background-color: #999 }', 'text/css');

      /*F.compileStyle(filename, data.toString('utf8'), (err, content) => {
        //if (!F.isDebug) fs.writeFile(tmp, content);
        F.responseContent(req, res, 200, content, 'text/css', true);
      });*/
    });
  });
});

F.compileStyle = (filename, content, cb) => {
  less.render(content, {
    paths: ['../node_modules', '../public/css'],
    filename: filename,
    compress: true
  }, cb);
};
