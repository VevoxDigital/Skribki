'use strict';

exports = module.exports = grunt => {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      wiki: ['./wiki'],
      logs: ['./logs/*'],
      dist: ['./dist']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('test', []);
};
