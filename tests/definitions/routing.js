'use strict'

const expect = require('expect.js')

exports.run = () => {
  F.assert('definition:Controller.prototype#viewError', next => {
    let code = 707
    let url = '/foo'
    let info = 'foobar'
    let context = {
      repository: { },
      req: { },
      view: (view, model) => {
        expect(view).to.be('error')

        expect(model.errno).to.be(code)
        expect(model.url).to.be(url)
        expect(model.info).to.be(info)
        next()
      }
    }
    global.Controller.prototype.viewError.call(context, code, url, info)
  })
}
