/*global module:false*/
module.exports = function ( grunt ) {
    "use strict";

    // Project configuration.
    grunt.initConfig( {
        pkg:'<json:package.json>',
        meta:{
            banner:'/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '* <%= pkg.url %>/\n' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
                '<%= pkg.author %>; Licensed <%= pkg.licenses[0].type %> */'
        },
        lint:{
            files:['grunt.js', 'src/**/*.js']
        },
        jasmine:{
            index:['specs/index.html']
        },
        min:{
            dist:{
                src:['<banner:meta.banner>', '<file_strip_banner:src/<%= pkg.name %>.js>'],
                dest:'bin/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },
        watch:{
            files:'<config:lint.files>',
            tasks:'lint test'
        },
        jshint:{
            options:{
                curly:true,
                eqeqeq:true,
                immed:true,
                latedef:true,
                newcap:true,
                noarg:true,
                sub:true,
                undef:true,
                boss:true,
                eqnull:true,
                smarttabs:false,
                strict:true
            },
            globals:{}
        },
        uglify:{},
        concat:{
            full:{
                src:['src/**/*.js'],
                dest:'bin/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        inject_vars:{
            files:[ 'bin/**/*.js' ]
        }
    } );

    grunt.loadNpmTasks( 'grunt-jasmine-task' );
    // Default task.
    grunt.registerTask( 'default', 'lint jasmine concat min inject_vars' );


    grunt.registerMultiTask( "inject_vars", "Injects user defined vars into bin files", function () {
        function replaceVersion( source ) {
            var result = source;
            while ( result.indexOf( '%VERSION%' ) > -1 ) {
                result = result.replace( "%VERSION%", grunt.config( "pkg.version" ) );
            }
            return result;
        }

        var files = grunt.file.expandFiles( this.file.src ),
            fileName;

        files.forEach( function ( fileName ) {
            var targetFile = fileName;
            grunt.file.copy( fileName, targetFile, {
                process:replaceVersion
            } );
        } );
        grunt.log.writeln( "Injected vars into " + files.length + " files." );
    } );
};
