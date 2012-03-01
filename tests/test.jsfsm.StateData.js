/**
 * @author Camille Reynders
 * Date: 01/03/12
 * Time: 12:26
 */

this.data = undefined;
var testConfig = {
    setup : function(){
        this.data = new jsfsm.StateData();
    },
    teardown : function(){
        this.data = undefined;
    }
};

module( 'jsfsm.StateData instance', testConfig );

test( 'should not be null', function(){
    ok( this.data != null && this.data != undefined );
});
test( 'should be of type <code>jsfsm.StateData</code>', function(){
    ok( this.data instanceof jsfsm.StateData );
})

module( 'jsfsm.StateData API signature', testConfig );

test( "should have property <code>initial</code>", function(){
    ok( 'initial' in this.data );
});
test( "should have property <code>children</code>", function(){
    ok( 'children' in this.data );
});
test( "should have property <code>transition</code>", function(){
    ok( 'transition' in this.data );
});
test( "should have property <code>onEnter</code>", function(){
    ok( 'onEnter' in this.data );
});
test( "should have property <code>onExit</code>", function(){
    ok( 'onExit' in this.data );
});
test( "should have property <code>onGuardEnter</code>", function(){
    ok( 'onGuardEnter' in this.data );
});
test( "should have property <code>onGuardExit</code>", function(){
    ok( 'onGuardExit' in this.data );
});

module( 'jsfsm.StateData#isValid', testConfig );
test( "should return <code>false</code> if data not valid", function(){
    strictEqual( this.data.isValid(), false );
} )
test( "should return <code>true</code> if data is valid", function(){
    this.data.transition = { 'foo' : 'bar' };
    strictEqual( this.data.isValid(), true );
})