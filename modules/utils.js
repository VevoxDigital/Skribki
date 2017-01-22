'use strict';

const path  = require('path'),
      _     = require('lodash');

exports.install = () => {

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

  /**
    * @prop lockedPatterns
    * List of patterns that are considered 'locked'
    */
  Utils.lockedPatterns = [
    /^\/special\//i, // Special pages/directores
    /^\/categor(?:y|ies)\//i,
    /^\/\./ // anything that starts with a dot
  ];

  /**
    * @function locked
    * Determines if the given route is locked
    *
    * @param rt The route
    * @return True if locked, false if not
    */
  Utils.locked = rt => {
    if (typeof rt !== 'string') return true;
    for (const pat of Utils.lockedPatterns)
      if (rt.match(pat)) return true;
    return false;
  }

  /**
    * @function checkEmail
    * Checks the email against the whitelist/blacklist
    *
    * @param email The email
    * @return True if valid (whitelisted/not blacklisted), false otherwise
    */
  Utils.checkEmail = email => {
    if (typeof email !== 'string') return false;

    return !!_.find(CONFIG('auth.emails'), check => {
      return (check instanceof RegExp && check.match(email)) || email === check
    }) === CONFIG('auth.whitelist');
  }

}
