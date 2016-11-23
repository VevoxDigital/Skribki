'use strict';

const lockedPatterns = [
  /^\/special\//i, // Special pages/directores
  /^\/categor(?:y|ies)\//i, // Categories
  /^\/(?:css|img|js)\//i, // Public files
  /\.(?:ico|png|jpg|gif|svg)(?:$|\?)/i // Images and other static files
];

exports.install = () => {
  // Setup locked directories and pages.
  F.lockedPatterns = lockedPatterns;
  F.locked = url => {
    if (typeof url !== 'string') throw new Error('Argument of type `' + typeof url + '` must be a string');
    for (const pattern of lockedPatterns) {
      if (url.match(pattern)) return true;
    }
    return false;
  };
};
