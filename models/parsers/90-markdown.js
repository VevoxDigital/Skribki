'use strict'

const marked = require('marked')
const q = require('q')

exports.id = 'parsers/markdown'

exports.run = doc => {
  doc.body = marked(doc.body)
  return q(doc)
}
