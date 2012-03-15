/**
 * @author Camille Reynders
 * Date: 14/03/12
 * Time: 10:42
 */

//inject the contents of the jshint.js file into this scope
var success = phantom.injectJs( phantom.args[ 0 ] );

(function (p) {
    "use strict";

    //load filesystem module
    var fs = require( 'fs' );

    //catch the path to the jsfile that needs to be jshinted
    var jsfile = p.args[ 1 ];

    console.log( 'read: ' + jsfile );

    if( ! fs.isReadable( jsfile ) ){
        console.log( 'unreadable file' );
        p.exit( true ); //failure
    }

    //see http://www.jshint.com/about/ for an explanation on the use of JSHint
    //read the contents of the js file and pass it to the JSHINT function
    var result = JSHINT( fs.read( jsfile ) );

    if( JSHINT.errors.length > 0 ){
        for( var i=0, n=JSHINT.errors.length ; i < n ; i++ ){
            var error = JSHINT.errors[ i ];
            console.log( [
                error.line + ":" + error.character,
                error.reason
            ].join( ' ' ) );
        }

        p.exit( true ); //failure
    }else{
        p.exit( false ); //success
    }

}(phantom));