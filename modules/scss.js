'use strict';

const sass  = require('node-sass'),
      fs    = require('fs');

exports.compile = (content) => {
  return sass.renderSync({
    data: content,
    outputStyle: 'compressed',
    includePaths: [ F.path.public('/styles/partials') ]
  }).css.toString();
};

exports.install = () => {
  F.file('/styles/*',scssCompiler);
  F.config['static-accepts']['.scss'] = true;

  F.onCompileCSS = (filename, content) => {
    return exports.compile(content);
  };
};

function scssCompiler(req, res, isValidation) {
  if (isValidation)
    return req.url.endsWith('.scss') || req.url.endsWith('.sass');

  let key = 'scss_' + req.url.substring(1),
      cached = F.cache.get(key);

  let output = data => {
    if (!this.config.debug) F.cache.set(key, data, F.datetime.add('m', 5)); // cache the stylesheet for 5 minutes
    this.responseContent(req, res, 200, data, 'text/css', true);
  };

  if (cached) output(cached);
  else fs.readFile(F.path.public(req.url), (err, data) => {
    if (err) return err.message.startsWith('ENOENT')
      ? this.response404(req, res)
      : this.response500(req, res, err);
    try {
      output(exports.compile(data.toString()));
    } catch (e) { this.response500(req, res, err); }
  });

}
