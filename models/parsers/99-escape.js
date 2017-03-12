'use strict'

const q = require('q')
const cheerio = require('cheerio')

exports.id = 'parsers/escape'

exports.run = doc => {
  let $ = cheerio.load(doc.body)
  $('script').remove()
  doc.body = $.html()
  return q(doc)
}
