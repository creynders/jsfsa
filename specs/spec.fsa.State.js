/**
 * @author Camille Reynders
 * Date: 07/03/12
 * Time: 15:37
 */
describe( "fsa.State", function(){
    var main;
    beforeEach( function(){
        main = new fsa.State( 'main' );
    });
    afterEach( function(){
        main = undefined;
    });
    beforeEach( function(){
        this.addMatchers({
            toBeInstanceOf : function( expected ){
                return this.actual instanceof expected;
            }
        })
    } );

    describe( "instance", function(){
        it("should be of type fsa.State", function(){
            expect( main ).toBeInstanceOf( fsa.State );
        });
    });
    describe( "constructor", function(){
        it( "should be able to use an object with strict formatting for initialization", function(){
            var f1 = function(){};
            var f2 = function(){};
            var config = {
                isInitial : true,
                parent : 'someParentState',
                guards : {
                    enter : f1,
                    exit : [ f1, f2 ]
                },
                actions : {
                    enter : [ f1, f2 ],
                    exit : f1
                },
                transitions:{
                    'foo' : 'barState',
                    'waldorf' : 'statlerState'
                }
            };
            var state = new fsa.State( 'test', config );
            expect( state.isInitial ).toBeTruthy();
            expect( state.hasGuard( 'enter', f1 ) ).toBeTruthy();
            expect( state.hasGuard( 'exit', f1 ) ).toBeTruthy();
            expect( state.hasGuard( 'exit', f2 ) ).toBeTruthy();
            expect( state.hasAction( 'enter', f1 ) ).toBeTruthy();
            expect( state.hasAction( 'enter', f2 ) ).toBeTruthy();
            expect( state.hasAction( 'exit', f1 ) ).toBeTruthy();
            expect( state.hasTransition( 'foo' ) ).toBeTruthy();
            expect( state.hasTransition( 'waldorf' ) ).toBeTruthy();
            expect( state.parent ).toEqual( 'someParentState' );
        });
        it( "should be able to use an object with loose formatting for initialization", function(){
            var f1 = function(){};
            var f2 = function(){};
            var config = {
                isInitial : true,
                guards : {
                    enter : f1,
                    exit : [ f1, f2 ]
                },
                actions : {
                    enter : [ f1, f2 ],
                    exit : f1
                },
                'foo' : 'barState',
                'waldorf' : 'statlerState'
            };
            var state = new fsa.State( "someParentState/test", config );
            expect( state.isInitial ).toBeTruthy();
            expect( state.hasGuard( 'enter', f1 ) ).toBeTruthy();
            expect( state.hasGuard( 'exit', f1 ) ).toBeTruthy();
            expect( state.hasGuard( 'exit', f2 ) ).toBeTruthy();
            expect( state.hasAction( 'enter', f1 ) ).toBeTruthy();
            expect( state.hasAction( 'enter', f2 ) ).toBeTruthy();
            expect( state.hasAction( 'exit', f1 ) ).toBeTruthy();
            expect( state.hasTransition( 'foo' ) ).toBeTruthy();
            expect( state.hasTransition( 'waldorf' ) ).toBeTruthy();
            expect( state.parent ).toEqual( 'someParentState' );
        });
    });
    describe( "#addTransition", function(){
        it( "should throw an error if required param 'transitionName' is missing", function(){
            expect( function(){main.addTransition()} ).toThrow( new Error( 1040 ) );
        });
        it( "should throw an error if required param 'transitionName' is of wrong type", function(){
            expect( function(){main.addTransition({})} ).toThrow( new Error( 1040 ) );
        });
        it( "should throw an error if required param 'stateName' is missing", function(){
            expect( function(){main.addTransition('foo')} ).toThrow( new Error( 1041 ) );
        })
        it( "should throw an error if required param 'stateName' is of wrong type", function(){
            expect( function(){main.addTransition('foo',{})} ).toThrow( new Error( 1041 ) );
        })
        it( "should return the state instance that was acted upon", function(){
            expect( main.addTransition('foo','bar') ).toEqual( main );
        });
    });
    describe( "#getTransition", function(){
        it( "should return undefined if no transitionName provided", function(){
            expect( main.getTransition() ).toBeUndefined();
        })
    });
    describe( "#hasTransition", function(){
        it( "should return false if no transitionName was provided", function(){
            expect( main.hasTransition()).toBeFalsy();
        });
    });
    describe( '#removeTransition', function(){
        it( "should return the state instance that was acted upon", function(){
            expect( main.removeTransition( 'foo' ) ).toEqual( main );
        });
    });

    describe( '#addAction', function(){
        it( "should throw an error if required param 'eventName' is missing", function(){
            expect( function(){main.addAction()} ).toThrow( new Error( 1060 ) );
        });
        it( "should throw an error if required param 'eventName' is unrecognized", function(){
            expect( function(){main.addAction('no event')} ).toThrow( new Error( 1060 ) );
        });
        it( "should throw an error if required param 'callback' is missing", function(){
            expect( function(){main.addAction('enter')} ).toThrow( new Error( 1061 ) );
        });
        it( "should throw an error if required param 'callback' of wrong type", function(){
            expect( function(){main.addAction('enter', {})} ).toThrow( new Error( 1061 ) );
        });
        it( "should return the state instance that was acted upon", function(){
            expect( main.addAction( 'enter', function(){} ) ).toEqual( main );
        });
    });
    describe( '#removeAction', function(){
        it( "should return the state instance that was acted upon", function(){
            expect( main.removeAction() ).toEqual( main );
        });
    });
    describe( '#hasAction', function(){
        it( "should return false if no eventName was provided", function(){
            expect( main.hasAction() ).toBeFalsy();
        });
        it( "should return false if no callback was provided", function(){
            expect( main.hasAction( 'enter' ) ).toBeFalsy();
        });
    });

    describe( '#addGuard', function(){
        it( "should throw an error if required param 'eventName' is missing", function(){
            expect( function(){main.addGuard()} ).toThrow( new Error( 1070 ) );
        });
        it( "should throw an error if required param 'eventName' is unrecognized", function(){
            expect( function(){main.addGuard('no event')} ).toThrow( new Error( 1070 ) );
        });
        it( "should throw an error if required param 'callback' is missing", function(){
            expect( function(){main.addGuard('enter')} ).toThrow( new Error( 1071 ) );
        });
        it( "should throw an error if required param 'callback' of wrong type", function(){
            expect( function(){main.addGuard('enter', {})} ).toThrow( new Error( 1071 ) );
        });
        it( "should return the state instance that was acted upon", function(){
            expect( main.addGuard( 'enter', function(){} ) ).toEqual( main );
        });
    });
    describe( '#removeGuard', function(){
        it( "should return the state instance that was acted upon", function(){
            expect( main.removeGuard() ).toEqual( main );
        });
    });
    describe( '#hasGuard', function(){
        it( "should return false if no eventName was provided", function(){
            expect( main.hasGuard() ).toBeFalsy();
        });
        it( "should return false if no callback was provided", function(){
            expect( main.hasGuard( 'enter' ) ).toBeFalsy();
        });
    });



} );