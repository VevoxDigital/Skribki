'use strict';

exports.run = () => {

  F.assert('page:view', '/', ['get'], (error, data, code, headers, cookies, name) => {
    assert.ok(code === 200 && data.startsWith('<!DOCTYPE html>'), name);

    let $ = F.loadDOM(data);
    assert.ok($('body').has('#page').length > 0, name + ':loaded');
    assert.ok($('#page').has('#pageBody').html().length > 0, name + ':viewLoaded');
  });

  const processorContent = {
    title: 'foo',
    desc: 'bar',
    categories: ['foobar'],
    body: '<p>a foobar</p><h1>a heading</h1><h2>a subheading</h2>'
  };

  F.assert('page:processPageContentEdit', (next, name) => {
    let context;
    context = {
      user: { name: 'foo' },
      url: '/',
      repository: { },
      view: (viewname, model) => {
        //assert.ok(context.repository.title === 'Editing Page', name + ':title');
        //assert.ok(context.repository.desc === 'Editing \'/\' as foo', name + ':desc');

        //assert.ok(viewname === 'page', name);
        //assert.ok(model.content = 'foobar', name + ':content');
        next();
      }
    };

    F.controller('page').processPageContentEdit(context, 'foobar');
  });

  F.assert('page:processPageContentEdit:dir', (next, name) => {
    let context;
    context = {
      user: true,
      url: '/test',
      redirect: url => {
        assert.ok(url === context.url + '/home?a=edit');
        next();
      }
    };
    F.controller('page').processPageContentEdit(context, { });
  });

  F.assert('page:processPageContentEdit:noUser', (next, name) => {
    let context;
    context = {
      url: '/test',
      redirect: url => {
        assert.ok(url === context.url, name);
        next();
      }
    };
    F.controller('page').processPageContentEdit(context);
  });

  F.assert('page:processPageContent', (next, name) => {
    let context;
    context = {
      repository: { },
      url: '/',
      view: (viewname, model) => {
        assert.ok(context.repository.title === processorContent.title, name + ':title');
        assert.ok(context.repository.desc === processorContent.desc, name + ':desc');
        assert.ok(context.repository.categories === processorContent.categories, name + ':categories');

        assert.ok(viewname === 'page', name + ':viewname');
        assert.ok(model.body === processorContent.body, name + ':body');
        next();
      }
    };

    F.controller('page').processPageContent(context, processorContent);
  });

};
