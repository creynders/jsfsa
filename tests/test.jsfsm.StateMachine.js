/**
 * @author Camille Reynders
 * Date: 28/02/12
 * Time: 10:42
 */

/**
 * @type jsfsm.StateMachine
 */
this.fsm = undefined;

var testingConfig = {
    setup : function(){
        this.fsm = new jsfsm.StateMachine();
    },
    teardown : function(){
        this.fsm = undefined;
    }
}

var testingStateData ={ transition : { foo : 'bar' } }

module( 'jsfsm.StateMachine instance', testingConfig );
test( 'should not be null', function(){
    ok( this.fsm != undefined && this.fsm != null );
} );
test( 'should be of type <code>jsfsm.StateMachine</code>', function(){
    ok( this.fsm instanceof jsfsm.StateMachine );
} );

module( 'jsfsm.StateMachine API signature', testingConfig );
test( "should have <code>fqn</code> property", function(){
    ok( 'fqn' in this.fsm );
});
test( "should have <code>addState</code> method", function(){
    ok( 'addState' in this.fsm );
});
test( "should have <code>hasState</code> method", function(){
    ok( 'hasState' in this.fsm );
});
test( "should have <code>getState</code> method", function(){
    ok( 'getState' in this.fsm );
});

module( 'jsfsm.StateMachine#hasState', testingConfig );
test( "should throw an exception if required param <code>stateName</code> is missing", function(){
    var fsm = this.fsm;
    var block = function(){
        fsm.hasState();
    }
    var expected = function( exception ){
        return exception.message === '1020';
    }
    raises( block, expected );
});
test( "should throw an exception if required param <code>stateName</code> is not of type <code>string</code>", function(){
    var fsm = this.fsm;
    var block = function(){
        fsm.hasState( {} );
    }
    var expected = function( exception ){
        return exception.message === '1020';
    }
    raises( block, expected );
});
test( "should return <code>false</code> if state not found", function(){
    ok( ! this.fsm.hasState( 'testState' ) );
})
test( "should return <code>true</code> if state is found", function(){
    this.fsm.addState( 'testState', testingStateData );
    ok( this.fsm.hasState( 'testState' ) );
})

module( 'jsfsm.StateMachine#addState', testingConfig );
test( "should throw an exception if required param <code>stateName</code> is missing", function(){
    var fsm = this.fsm;
    var block = function(){
        fsm.addState();
    }
    var expected = function( exception ){
        return exception.message === '1010';
    }
    raises( block, expected );
});
test( "should throw an exception if required param <code>stateName</code> is not of type <code>string</code>", function(){
    var fsm = this.fsm;
    var block = function(){
        fsm.addState( {} );
    }
    var expected = function( exception ){
        return exception.message === '1010';
    }
    raises( block, expected );
});
test( "should throw an exception if required param <code>stateData</code> is missing", function(){
    var fsm = this.fsm;
    var block = function(){
        fsm.addState( 'testState' );
    }
    var expected = function( exception ){
        return exception.message === '1011';
    }
    raises( block, expected );
});
test( "should throw an exception if <code>stateData</code> is inValid", function(){
    var fsm = this.fsm;
    var block = function(){
        fsm.addState( 'testState',{} );
    }
    var expected = function( exception ){
        return exception.message === '1012';
    }
    raises( block, expected );
});
test( "should return the <code>jsfsm.StateMachine</code> instance", function(){
    var result = this.fsm.addState( 'testState', testingStateData );
    ok( result instanceof jsfsm.StateMachine );
});

module( 'jsfsm.StateMachine#getState', testingConfig );
test( "should throw an exception if required param <code>stateName</code> is missing", function(){
    var fsm = this.fsm;
    var block = function(){
        fsm.getState();
    }
    var expected = function( exception ){
        return exception.message === '1030';
    }
    raises( block, expected );
});
test( "should return <code>undefined</code> if state not found", function(){
    strictEqual( this.fsm.getState( 'testState' ), undefined );
} );
test( "should return strictly equal stateData object to the one added", function(){
    this.fsm.addState( 'testState', testingStateData );
    strictEqual( this.fsm.getState( 'testState' ), testingStateData );
} );