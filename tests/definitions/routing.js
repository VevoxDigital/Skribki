'use strict'

const expect = require('expect.js')

exports.run = () => {
  const middleware = F.$routingMiddleware

  // test the middleware functions
  F.assert('definition:routing.middleware[\'public-files\']', done => {
    middleware['public-files']({
      url: '/public/img'
    }, {
      redirect: url => {
        expect(url).to.be('/img')
        done()
      }
    })
  })
  F.assert('definition:routing.middleware[\'route-normalizer\']', done => {
    middleware['route-normalizer']({
      url: '/foo/bar/baz/',
      method: 'GET'
    }, {
      redirect: url => {
        expect(url).to.be('/foo/bar/baz')
        done()
      }
    })
  })
  // we don't need to test route logging...

  F.assert('definition:routing.Controller.prototype#viewError', next => {
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
