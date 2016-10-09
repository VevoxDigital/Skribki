'use strict';

const inquirer  = require('inquirer'),
      git       = require('simple-git'),
      fs        = require('fs-extra'),
      path      = require('path'),
      Q         = require('q');

exports = module.exports = () => {
  console.log('Repository has not been initialized, doing so now...');
  let deferred = Q.defer();

  inquirer.prompt([{
    type: 'confirm',
    name: 'useBareRepository',
    message: 'Initialize repository as bare?',
    default: false
  }]).then(answers => {
    console.log('Okay. Repo', answers.useBareRepository ? 'will' : 'will not', 'be bare.');
    console.log('Finishing things up...');

    let cwd = path.join(__dirname, '..', 'repo');
    console.log(cwd);
    try {
      fs.mkdirSync(cwd);
      deferred.resolve(git(cwd).init(answers.useBareRepository));
    } catch (e) {
      deferred.reject(e);
    }
  });

  return deferred.promise;
};
