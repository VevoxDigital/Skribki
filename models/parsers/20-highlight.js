'use strict'

const q = require('q')
const hljs = require('highlight.js')

const PATTERN = /```(\S+)\n((?:.|\n)+?)\n```/g

exports.id = 'parsers/hightlight'

exports.run = content => {
  let match
  while ((match = PATTERN.exec(content)) !== null) {
    try {
      let syntax = hljs.highlight(match[1], match[2])
      content = [content.slice(0, match.index),
        '<pre><code>' + syntax.value + '</code></pre>',
        content.slice(match.index + match[0].length)].join('')
    } catch (e) {
      // no-op
    }
  }

  return q(content)
}
