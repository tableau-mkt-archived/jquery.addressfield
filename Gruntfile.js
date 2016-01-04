'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('addressfield.jquery.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    clean: {
      files: ['dist']
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      build: {
        src: [
          'src/jquery.detach-polyfill.js',
          'src/jquery.<%= pkg.name %>.js'
        ],
        dest: 'dist/jquery.<%= pkg.name %>.js'
      }
    },
    connect: {
      server: {
        options: {
          port: 8085
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.build.dest %>',
        dest: 'dist/jquery.<%= pkg.name %>.min.js'
      }
    },
    qunit: {
      options: {
        '--web-security': 'no',
        coverage: {
          disposeCollector: true,
          baseUrl: 'http://localhost:<%= connect.server.options.port %>/',
          src: ['src/jquery.addressfield.js'],
          instrumentedFiles: '.temp/',
          htmlReport: 'report/coverage',
          lcovReport: 'report/',
          linesThresholdPct: 80,
          statementsThresholdPct: 80,
          functionsThresholdPct: 80,
          branchesThresholdPct: 80
        }
      },
      all: {
        options: {
          urls: ['1.3.2', '1.4.4', '1.5.2', '1.6.4', '1.7.2', '1.8.3', '1.9.1', '1.10.2', '1.11.1', 'git1', '2.0.3', '2.1.0', '2.1.1', 'git2'].map(function(version) {
            return 'test/addressfield.html?jquery=' + version;
          })
        }
      }
    },
    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      src: {
        options: {
          jshintrc: 'src/.jshintrc'
        },
        src: ['src/**/*.js']
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/**/*.js']
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: '<%= jshint.src.src %>',
        tasks: ['jshint:src', 'qunit']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'qunit']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-qunit-istanbul');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task.
  grunt.registerTask('default', ['connect', 'jshint', 'qunit', 'clean', 'concat', 'uglify']);

  // Test task.
  grunt.registerTask('test', ['connect', 'jshint', 'qunit']);

};
