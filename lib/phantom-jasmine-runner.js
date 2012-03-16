(function (p) {

    /**
     * Wait until the test condition is true or a timeout occurs. Useful for waiting
     * on a server response or for a ui change (fadeIn, etc.) to occur.
     *
     * @param testFx javascript condition that evaluates to a boolean,
     * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
     * as a callback function.
     * @param onReady what to do when testFx condition is fulfilled,
     * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
     * as a callback function.
     * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
     */

    function waitFor(testFx, onReady, timeOutMillis) {
        var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3001, //< Default Max Timeout is 3s
            start = new Date().getTime(),
            condition = false,
            interval = setInterval(function() {
                if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                    // If not time-out yet and condition not yet fulfilled
                    condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
                } else {
                    if(!condition) {
                        // If condition still not fulfilled (timeout but condition is 'false')
                        console.log("timeout");
                        p.exit( true );
                    } else {
                        // Condition fulfilled (timeout and/or condition is 'true')
                        console.log("finished in " + (new Date().getTime() - start) + "ms.");
                        typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                        clearInterval(interval); //< Stop this interval
                    }
                }
            }, 100); //< repeat check every 100ms
    };

    if (p.args.length === 0 || p.args.length > 2) {
        console.log('Usage: phantom-jasmine-runner.js path/to/specrunner.html');
        p.exit( true );
    }

    var page = require('webpage').create();

    // Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
    page.onConsoleMessage = function(msg) {
        console.log(msg);
    };

    //load filesystem module
    var fs = require( 'fs' );

    //transform the path to a URL
    var path = 'file:///' + encodeURI( fs.absolute( p.args[ 0 ] ) );
    console.log( 'open: ' + path );

    var timeout = p.args[ 1 ];

    //now open the page and wait for results
    page.open( path, function(status){
        console.log( status );
        if (status !== "success") {
            console.log("Unable to access network");
            p.exit( true );
        } else {
            waitFor(function(){
                return page.evaluate(function(){
                    if (document.body.querySelector('.runner .description')) {
                        return true;
                    }
                    return false;
                });
            }, function(){
                var failed = page.evaluate(function(){
                    var description = document.body.querySelector('.description').innerText;
                    console.log( description );
                    list = document.body.querySelectorAll('div.jasmine_reporter > div.suite.failed');
                    for (i = 0; i < list.length; ++i) {
                        el = list[i];
                        desc = el.querySelectorAll('.description');
                        console.log('');
                        for (j = 0; j < desc.length; ++j) {
                            console.log(desc[j].innerText);
                        }
                    }

                    return description.indexOf( '0 failures' ) < 0;
                });
                p.exit( failed );
            }, timeout);
        }
    });
}(phantom));