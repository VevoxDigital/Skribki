'use strict';

F.helpers.markdown = content => {
  content.replace('<', '&lt;');
  content.replace('>', '&gt;');

  return require('marked')(content);
};
