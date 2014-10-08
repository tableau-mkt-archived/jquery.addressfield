'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      files: ['build']
    },
    jsonlint: {
      sample: {
        src: [ 'src/addressfield.json' ]
      }
    },
    jsonmin: {
      dev: {
        options: {
          stripWhitespace: true,
          stripComments: true
        },
        files: {
          "build/addressfield.min.json" : "src/addressfield.json"
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-jsonlint');
  grunt.loadNpmTasks('grunt-jsonmin');

  // Default task.
  grunt.registerTask('default', ['clean', 'jsonlint', 'jsonmin']);

};
