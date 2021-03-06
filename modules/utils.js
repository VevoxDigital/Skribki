'use strict'

const path = require('path')
const _ = require('lodash')

exports.install = () => {
  /**
    * @function normalize
    * Normalizes the given url to a standardized format.
    *
    * @param url The url to normalize
    * @return The normalized url
    */
  U.normalize = (url = '') => {
    url = url.toString()

    // remove any leading dots or trailing slashes
    while (url.match(/\.+\//)) url = url.substring(1)
    while (url.endsWith('/')) url = url.slice(0, -1)

    // append a leading slash
    if (!url.startsWith('/')) url = '/' + url

    // apply path#normalize and return
    return path.normalize(url)
  }

  /**
    * @function escape
    * Escapes the given string into a JSON format then escapes backticks
    *
    * @param str The string to escape
    * @return The escaped string
    */
  U.escape = str => {
    // "stringify" the string, escaping many JSON-invalid characters
    return JSON.stringify(str)

      // remove the quotes created by JSON.stringify
      .substring(1).slice(0, -1)

      // escape backticks
      .replace(/`/g, '\\`')
  }

  /**
    * @prop lockedPatterns
    * List of patterns that are considered 'locked'
    */
  U.lockedPatterns = [
    /^\/special\//i, // Special pages/directores
    /^\/categor(?:y|ies)\//i,
    /^\/(?:img\/|styles\/|favicon)/i, // public files
    /^\/repo\.lck$/, // the repo lock
    /^\/\./ // anything that starts with a dot
  ]

  /**
    * @function locked
    * Determines if the given route is locked
    *
    * @param rt The route
    * @return True if locked, false if not
    */
  U.locked = rt => {
    if (typeof rt !== 'string') return true
    for (const pat of U.lockedPatterns) {
      if (rt.match(pat)) return true
    }
    return false
  }

  /**
    * @function checkEmail
    * Checks the email against the whitelist/blacklist
    *
    * @param email The email
    * @return True if valid (whitelisted/not blacklisted), false otherwise
    */
  U.checkEmail = email => {
    if (typeof email !== 'string') return false

    return !!_.find(F.config['auth.emails'], check => {
      if (check.startsWith('/')) {
        let flagsIndex = check.lastIndexOf('/')
        let pattern = new RegExp(check.substring(1, flagsIndex), check.substring(flagsIndex + 1))
        return email.match(pattern)
      } else return email === check
    }) === F.config['auth.whitelist']
  }

  /**
    * @function localize
    * Localizes the given resource key to the given language
    *
    * @param lang The langage, can be a string or a Request
    * @param key The resource key
    * @return The localized string in the given or wiki default language, else the resource key
    */
  U.localize = function (lang, key) {
    let localized = F.resource(typeof lang === 'object' ? lang.language : lang, key) ||
      F.resource(F.config['wiki.lang'], key) || key
    _.each(Array.prototype.slice.call(arguments, 2), (arg, i) => {
      localized = localized.replace(new RegExp('\\{' + i + '\\}', 'g'), arg)
    })
    return localized
  }
}
