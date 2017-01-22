'use strict';

const path = require('path');

/**
  * @function normalize
  * Normalizes the given url to a standardized format.
  *
  * @param url The url to normalize
  * @return The normalized url
  */
Utils.normalize = (url = '') => {
  url = url.toString();

  // remove any leading dots or trailing slashes
  while (url.startsWith('.')) url = url.substring(1);
  while (url.endsWith('/')) url = url.slice(0, -1);

  // append a leading slash
  if (!url.startsWith('/')) url = '/' + url;

  // apply path#normalize and return
  return path.normalize(url);
}

/**
  * @function escape
  * Escapes the given string into a JSON format then escapes backticks
  *
  * @param str The string to escape
  * @return The escaped string
  */
Utils.escape = str => {
  assert.strictEqual(typeof str, 'string', 'input must be a string');

  // "stringify" the string, escaping many JSON-invalid characters
  return JSON.stringify(str)

    // remove the quotes created by JSON.stringify
    .substring(1).slice(0, -1)

    // escape backticks
    .replace(/`/g, '\\`');
}
