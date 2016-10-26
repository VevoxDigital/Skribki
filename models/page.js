exports.id = 'page';
exports.version = '1';

exports.create = (route, author, done) => {
  console.log('create ' + route + ' from ' + author);
  done();
};

exports.read = (route, done) => {
  console.log('read ' + route + ' from ' + author);
  done();
};

exports.update = (route, content, done) => {
  console.log('update ' + route + ' from ' + author);
  done();
};

exports.delete = (route, done) => {
  console.log('delete ' + route + ' from ' + author);
  done();
};
