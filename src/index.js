'use strict';

console.log('Hello world');

require('./setup.js')().then(repo => {
  console.log('ok');
}, e => {
  console.log(e);
});
