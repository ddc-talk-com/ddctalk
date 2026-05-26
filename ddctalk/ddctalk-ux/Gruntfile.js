/* jshint node: true *//* eslint-env node */

"use strict";

const loadTasksRelative = require('grunt-niagara/lib/loadTasksRelative');

const SRC_FILES = [
  'src/rc/**/*.js',
  'Gruntfile.js',
  '!**/*.built.js',
  '!**/*.built.min.js'
];
const TEST_FILES = [
  'srcTest/rc/**/*.js'
];
const JS_FILES = SRC_FILES.concat(TEST_FILES);
const ALL_FILES = JS_FILES.concat(['src/rc/**/*.less', 'src/rc/**/*.html']);

module.exports = function runGrunt(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jsdoc: {
      src: SRC_FILES.concat([ 'README.md' ])
    },
    eslint: {
      src: JS_FILES,
      options: {
        plugins: [ 'react' ]
      }
    },
    babel: {
      options: {
        presets: [ '@babel/preset-env' ],
        plugins: [ '@babel/plugin-transform-react-jsx' ]
      },
      coverage: {
        options: {
          plugins: [ '@babel/plugin-transform-react-jsx', 'istanbul' ]
        }
      }
    },
    watch: {
      src: ALL_FILES,
      tasks: (tasks) => [ 'less', 'copy' ].concat(tasks)
      
    },
    less: {
      options: {
        banner: '/* @noSnoop */',
        sourceMap: true,
        sourceMapBasepath: 'src',
        sourceMapRootpath: '/module/ddctalk/'
      },
      ddctalk: {
        options: {
          sourceMapFilename: 'build/src/maps/ddctalk.map',
          sourceMapURL: '/module/ddctalk/maps/ddctalk.map'
        },
        files: {
          'build/src/rc/ddctalk.css': 'src/rc/ddctalk.less',
          'build/karma/src/rc/ddctalk.css': 'src/rc/ddctalk.less'
        }
      }
    },
    copy: {
      html: {
        expand: true,
        cwd: 'src/',
        src: ['rc/**/*.html'],
        dest: 'build/src/'
      }
    },
    karma: {},
    requirejs: {},
    niagara: {
      station: {
        stationName: 'ddctalk',
        forceCopy: true,
        sourceStationFolder: './srcTest/rc/stations/ddctalkUnitTest'
      }
    }
  });

  loadTasksRelative(grunt, 'grunt-niagara');
  loadTasksRelative(grunt, 'grunt-contrib-less');
  loadTasksRelative(grunt, 'grunt-contrib-copy');
    
};
