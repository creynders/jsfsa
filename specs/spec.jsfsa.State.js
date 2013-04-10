/**
 * @author Camille Reynders
 * Date: 07/03/12
 * Time: 15:37
 */
describe( "jsfsa.State", function(){
    "use strict";
    var main;
    beforeEach( function(){
        main = new jsfsa.State( 'main' );
    });
    afterEach( function(){
        main = undefined;
    });
    beforeEach( function(){
        this.addMatchers({
            toBeInstanceOf : function( expected ){
                return this.actual instanceof expected;
            }
        });
    } );

    describe( "instance", function(){
        it("should be of type jsfsa.State", function(){
            expect( main ).toBeInstanceOf( jsfsa.State );
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
                    entry : f1,
                    exit : [ f1, f2 ]
                },
                listeners : {
                    entered : [ f1, f2 ],
                    exited : f1
                },
                transitions:{
                    'foo' : 'barState',
                    'waldorf' : 'statlerState'
                }
            };
            var state = new jsfsa.State( 'test', config );
            expect( state.isInitial ).toBeTruthy();
            expect( state.hasGuard( jsfsa.Action.ENTRY, f1 ) ).toBeTruthy();
            expect( state.hasGuard( jsfsa.Action.EXIT, f1 ) ).toBeTruthy();
            expect( state.hasGuard( jsfsa.Action.EXIT, f2 ) ).toBeTruthy();
            expect( state.hasListener( jsfsa.StateEvent.ENTERED, f1 ) ).toBeTruthy();
            expect( state.hasListener( jsfsa.StateEvent.ENTERED, f2 ) ).toBeTruthy();
            expect( state.hasListener( jsfsa.StateEvent.EXITED, f1 ) ).toBeTruthy();
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
                    entry : f1,
                    exit : [ f1, f2 ]
                },
                listeners : {
                    entered : [ f1, f2 ],
                    exited : f1
                },
                'foo' : 'barState',
                'waldorf' : 'statlerState'
            };
            var state = new jsfsa.State( "someParentState/test", config );
            expect( state.isInitial ).toBeTruthy();
            expect( state.hasGuard( jsfsa.Action.ENTRY, f1 ) ).toBeTruthy();
            expect( state.hasGuard( jsfsa.Action.EXIT, f1 ) ).toBeTruthy();
            expect( state.hasGuard( jsfsa.Action.EXIT, f2 ) ).toBeTruthy();
            expect( state.hasListener( jsfsa.StateEvent.ENTERED, f1 ) ).toBeTruthy();
            expect( state.hasListener( jsfsa.StateEvent.ENTERED, f2 ) ).toBeTruthy();
            expect( state.hasListener( jsfsa.StateEvent.EXITED, f1 ) ).toBeTruthy();
            expect( state.hasTransition( 'foo' ) ).toBeTruthy();
            expect( state.hasTransition( 'waldorf' ) ).toBeTruthy();
            expect( state.parent ).toEqual( 'someParentState' );
        });
    });
    describe( "#addTransition", function(){
        it( "should return the state instance that was acted upon", function(){
            expect( main.addTransition('foo','bar') ).toEqual( main );
        });
    });
    describe( "#getTransition", function(){
        it( "should return undefined if no transitionName provided", function(){
            expect( main.getTransition() ).toBeUndefined();
        });
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
        it( "should return the state instance that was acted upon", function(){
            expect( main.addListener( jsfsa.StateEvent.ENTERED, function(){} ) ).toEqual( main );
        });
    });
    describe( '#removeListener', function(){
        it( "should return the state instance that was acted upon", function(){
            expect( main.removeListener() ).toEqual( main );
        });
    });
    describe( '#hasListener', function(){
        it( "should return false if no eventName was provided", function(){
            expect( main.hasListener() ).toBeFalsy();
        });
        it( "should return false if no callback was provided", function(){
            expect( main.hasListener( jsfsa.StateEvent.ENTERED ) ).toBeFalsy();
        });
    });

    describe( '#addGuard', function(){
        it( "should return the state instance that was acted upon", function(){
            expect( main.addGuard( jsfsa.Action.ENTRY, function(){} ) ).toEqual( main );
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
            expect( main.hasGuard( jsfsa.Action.ENTRY ) ).toBeFalsy();
        });
    });

    describe( "a registered listener", function(){
        var spy;
        var sm;
        var config = {
            "green" : { isInitial : true, "next" : "orange" },
            "orange" : { "next" : "red" },
            "red" : { "next" : "green" }
        };
        beforeEach( function(){
            spy = jasmine.createSpy( 'actionSpy' );
            sm = new jsfsa.Automaton( config );
        });

        it( "should be called upon exit", function(){
            var green = sm.getState( 'green' );
            green.addListener( jsfsa.StateEvent.EXITED, spy );
            sm.doTransition( 'next' );
            expect( spy ).toHaveBeenCalled();
        });
        it( "should be called upon entry", function(){
            var orange = sm.getState( 'orange' );
            orange.addListener( jsfsa.StateEvent.ENTERED, spy );
            sm.doTransition( 'next' );
            expect( spy ).toHaveBeenCalled();
        });
        it( "should receive an event object", function(){
            var orange = sm.getState( 'orange' );
            orange.addListener( jsfsa.StateEvent.ENTERED, spy );
            sm.doTransition( 'next' );
            var e = new jsfsa.StateEvent( jsfsa.StateEvent.ENTERED, 'green', 'orange', 'next' );
            expect( spy ).toHaveBeenCalledWith( e );
        });
        it( "should recieve a passed payload", function(){
            var orange = sm.getState( 'orange' );
            orange.addListener( jsfsa.StateEvent.ENTERED, spy );
            var payload = {
                foo : "bar"
            };
            sm.doTransition( 'next', payload );
            var e = new jsfsa.StateEvent( jsfsa.StateEvent.ENTERED, 'green', 'orange', 'next');
            expect( spy ).toHaveBeenCalledWith( e, payload );

        });
        it( "should be able to pause and restart the fsm", function(){
            var callback = function(){
                sm.pause();
            };

            runs( function(){
                var green = sm.getState( 'green' );
                green.addListener( jsfsa.StateEvent.EXITED, callback );
            });

            runs( function(){
                var s = sm;
                sm.doTransition( 'next' );
                expect( sm.isTransitioning() ).toBeTruthy();
            });

            waits( 500 );

            runs( function(){
                expect( sm.isTransitioning() ).toBeTruthy();
                sm.proceed();
                expect( sm.isTransitioning() ).toBeFalsy();
            });
        } );
    });


} );