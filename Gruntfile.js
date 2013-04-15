/*global module:false*/
module.exports = function (grunt) {
    "use strict";

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> ' + 'Copyright (c) <%= grunt.template.today("yyyy") %> ' + '<%= pkg.author %>; Licensed <%= pkg.licenses[0].type %> */'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'bin/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },
        watch: {
            files: '<config:lint.files>',
            tasks: 'lint test'
        },
        jshint: {
            all: ['Gruntfile.js', 'src/**/*.js', 'specs/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        concat: {
            source: {
                src: ['src/**/*.js'],
                dest: 'bin/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        inject_vars: {
            bin: {
                src: ['bin/*<%= pkg.version %>*.js']
            }
        },
        jasmine: {
            src: ['src/**/*.js'],
            dist: [ 'bin/*<%= pkg.version %>.min.js' ],
            options: {
                specs: ['specs/**/*.js']
            }
        },
        jsdoc: {
            dist: {
                src: ['src/*.js'],
                options: {
                    destination: 'docs',
                    private: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    // Default task.
    grunt.registerTask('test', ['jshint', 'jasmine:src']);
    grunt.registerTask('consolidate', ['concat', 'uglify', 'inject_vars']);
    grunt.registerTask('build', ['test', 'consolidate']);
    grunt.registerTask('docs', ['jsdoc']);
    grunt.registerTask('travis', ['jshint', 'jasmine']);

    grunt.registerMultiTask("inject_vars", "Injects user defined vars into bin files", function () {
        function replaceVersion(content, filepath) {
            var result = content;
            while (result.indexOf('%VERSION%') > -1) {
                result = result.replace("%VERSION%", grunt.config("pkg.version"));
            }
            return result;
        }

        var sources = this.files; //for legibility
        sources.forEach(function (files) {
            grunt.log.writeln("Inject vars into " + files.src);
            files.src.forEach(function (filepath) {
                var targetFile = filepath;
                grunt.file.copy(filepath, targetFile, {
                    process: replaceVersion
                });
            });
        });
    });
};