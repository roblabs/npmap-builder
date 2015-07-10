module.exports = function(grunt) {
  'use strict';

  var buildId = new Date().getTime();

  grunt.initConfig({
    buildId: buildId,
    clean: [
      '_site/css',
      '_site/data',
      '_site/img',
      '_site/js',
      '_site/ui',
      '_site/iframe.html'
    ],
    copy: {
      site: {
        files: [{
          cwd: 'assets/libs/bootstrap-editable/img/',
          dest: '_site/img/',
          expand: true,
          src: [
            '**/*'
          ]
        },{
          cwd: 'assets/libs/bootstrap-slider/img/',
          dest: '_site/img/',
          expand: true,
          src: [
            '**/*'
          ]
        },{
          cwd: 'img/',
          dest: '_site/img/',
          expand: true,
          src: [
            '**/*'
          ]
        },{
          cwd: 'ui/',
          dest: '_site/ui/',
          expand: true,
          rename: function(dest, src) {
            src = src.replace('.css', '-' + buildId + '.css');
            src = src.replace('.html', '-' + buildId + '.html');
            src = src.replace('.js', '-' + buildId + '.js');
            return dest + src;
          },
          src: [
            '**/*'
          ]
        }]
      }
    },
    cssmin: {
      site: {
        files: {
          '_site/css/app-<%= buildId %>.min.css': [
            'assets/libs/alertify/css/alertify-core.css',
            'assets/libs/alertify/css/alertify-bootstrap.css',
            'assets/libs/bootstrap-editable/css/bootstrap-editable.css',
            'assets/libs/bootstrap-select/css/bootstrap-select.css',
            'assets/libs/bootstrap-colorpickersliders/bootstrap.colorpickersliders.css',
            'assets/libs/bootstrap-slider/css/bootstrap-slider.css',
            'assets/libs/typeahead/typeahead.css',
            'css/app.css'
          ]
        }
      },
      ui: {
        cwd: '_site/ui/',
        dest: '_site/ui/',
        expand: true,
        src: [
          '**/*.css'
        ]
      }
    },
    htmlmin: {
      site: {
        files: {
          '_site/iframe.html': 'iframe.min.html',
          '_site/index.html': 'index.min.html'
        },
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeComments: true,
          removeCommentsFromCDATA: true,
          removeRedundantAttributes: true
        }
      },
      ui: {
        cwd: '_site/ui/',
        dest: '_site/ui/',
        expand: true,
        options: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeComments: true,
          removeCommentsFromCDATA: true,
          removeRedundantAttributes: true
        },
        src: [
          '**/*.html'
        ]
      }
    },
    pkg: require('./package.json'),
    'string-replace': {
      app: {
        files: {
          '_site/js/app-<%= buildId %>.min.js': '_site/js/app-<%= buildId %>.min.js'
        },
        options: {
          replacements: [{
            pattern: /".css"/g,
            replacement: '"-' + buildId + '.css"'
          },{
            pattern: /".html"/g,
            replacement: '"-' + buildId + '.html"'
          },{
            pattern: /".js"/g,
            replacement: '"-' + buildId + '.js"'
          }]
        }
      },
      index: {
        files: {
          '_site/index.html': '_site/index.html'
        },
        options: {
          replacements: [{
            pattern: /js\/app.min.js/g,
            replacement: 'js/app-' + buildId + '.min.js'
          },{
            pattern: /css\/app.min.css/g,
            replacement: 'css/app-' + buildId + '.min.css'
          }]
        }
      }
    },
    uglify: {
      site: {
        files: {
          '_site/js/app-<%= buildId %>.min.js': [
            'assets/libs/alertify/js/alertify.js',
            'assets/libs/bootstrap-colorpickersliders/bootstrap.colorpickersliders.js',
            'assets/libs/bootstrap-editable/js/bootstrap-editable.js',
            'assets/libs/bootstrap-editable/js/bootstrap-filestyle.js',
            'assets/libs/bootstrap-select/js/bootstrap-select.js',
            'assets/libs/bootstrap-slider/js/bootstrap-slider.js',
            'assets/libs/jquery-nestable/js/jquery-nestable.js',
            'assets/libs/moment.js',
            'assets/libs/typeahead/typeahead.js',
            'js/app.js'
          ]
        },
        options: {
          beautify: false
        }
      },
      ui: {
        cwd: '_site/ui/',
        dest: '_site/ui/',
        expand: true,
        options: {
          beautify: false
        },
        src: [
          '**/*.js'
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.registerTask('default', ['clean', 'htmlmin:site', 'copy', 'cssmin:site', 'uglify', 'string-replace:app', 'string-replace:index', 'cssmin:ui', 'htmlmin:ui']);
};
