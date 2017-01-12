'use strict';

const sass  = require('node-sass'),
      fs    = require('fs');

exports.compile = (content) => {
  try {
    return sass.renderSync({
      data: content,
      outputStyle: 'compressed',
      includePaths: [ F.path.public('/styles/partials') ]
    }).css.toString();
  } catch (e) {
    console.log(e.stack);
    return '';
  }
};

exports.install = () => {
  F.file('/styles/*',scssCompiler);
  F.config['static-accepts']['.scss'] = true;

  F.onCompileCSS = (filename, content) => {
    return exports.compile(content);
  };
};

/* eslint complexity: ["error", 7] */
function scssCompiler(req, res, isValidation) {
  if (isValidation)
    return req.url.endsWith('.scss') || req.url.endsWith('.sass');

  let self = this;

  let key = 'scss_' + req.url.substring(1),
      cached = F.cache.get(key);

  if (cached) return cached;
  else {
    try {
      let output = exports.compile(fs.readFileSync(F.path.public(req.url)).toString());
      if (!self.config.debug) F.cache.set(key, output, F.datetime.add('m', 4));
      self.responseContent(req, res, 200, output, 'text/css', true);
    } catch (e) {
      if (e.message.startsWith('ENOENT')) self.response404(req, res);
      else self.response500(req, res, e);
    }
  }
}
