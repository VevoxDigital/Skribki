'use strict'

const marked = require('marked')
const q = require('q')

exports.id = 'parsers/markdown'

exports.run = content => {
  return q(marked(content))
}
