/**
 * @author Camille Reynders
 * Date: 08/03/12
 * Time: 11:44
 */
describe("fsa.Automaton", function(){
    var sm;
    beforeEach( function(){
        sm = new fsa.Automaton();
    });
    beforeEach( function(){
        this.addMatchers({
            toBeInstanceOf : function( expected ){
                return this.actual instanceof expected;
            }
        })
    } );
    afterEach( function(){
        sm.destroy();
        sm = undefined;
    });

    describe("instance", function(){
        it( "should be of type fsa.Automaton", function(){
            expect( sm ).toBeInstanceOf( fsa.Automaton );
        });
        it( "should have a root state", function(){
            expect( sm.getRootState() ).toBeInstanceOf( fsa.State );
        })
    });

    describe( "an added state", function(){
        it( "should be detectable", function (){
            var state = new fsa.State( 'foo' );
            sm.addState( state );
            expect( sm.hasState( state.name ) ).toBeTruthy();
        } );
        it( "should be removable", function(){
            var state = new fsa.State( 'foo' );
            sm
                .addState( state )
                .removeState( state.name )
            ;
            expect( sm.hasState( state.name ) ).toBeFalsy();
        });
        it( "should be retrievable", function(){
            var state = new fsa.State( 'foo' );
            sm.addState( state );
            expect( sm.getState( state.name ) ).toEqual( state );
        });
    });

    describe( "the automaton", function(){
        beforeEach( function(){
            sm.createState( 'off', { transitions : { 'ignite' : 'on' }, isInitial : true } );
            sm.createState( 'on', { transitions : { 'shutdown' : 'off' } } );
        });
        it( "should be able to transition to another state", function(){
            sm.doTransition( 'ignite' );
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'on' ) );
        } );
        it( "should be able to transition back", function(){
            sm.doTransition( 'ignite' );
            sm.doTransition( 'shutdown' );
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'off' ) );
        } );
        it( "should fail silently if transition is not allowed", function(){
            sm.doTransition( 'ignite' );
            sm.doTransition( 'ignite' );
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'on' ) );
        });
        it( "should fail silently if transition is not found", function(){
            sm.doTransition( 'ignite' );
            sm.doTransition( 'whatever' );
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'on' ) );
        });
        it( "should fail silently if target is not found", function(){
            sm.doTransition( 'ignite' );
            sm.removeState( 'off' );
            sm.doTransition( 'shutdown' );
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'on' ) );
        });
        it( "should fail silently if no states present", function(){
            sm.doTransition( 'ignite' );
            sm.removeState( 'off' );
            sm.removeState( 'on' );
            sm.doTransition( 'shutdown' );
        });
        it( "should revert to the parent node if a current state is removed", function(){
            sm.doTransition( 'ignite' );
            sm.removeState( 'on' );
            expect( sm.getCurrentState() ).toEqual( sm.getRootState() );
        } );
    });
    describe( "the automaton", function(){
        beforeEach( function(){
            sm.createState( 'green',    { transitions : { 'next' : 'orange' }, isInitial : true } );
            sm.createState( 'orange',   { transitions : { 'next' : 'red'    } } );
            sm.createState( 'red',      { transitions : { 'next' : 'green'  } } );
        } );
        it( "should allow for multiple transitions with the same name", function(){
            sm.doTransition( 'next' );
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'orange' ) );
            sm.doTransition( 'next' );
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'red' ) );
            sm.doTransition( 'next' );
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'green' ) );
        });
        it( "should terminate transition with guards denying entry", function(){
            var orange = sm.getState( 'orange' );
            var f = function(){
                return false
            }
            orange.addGuard( 'enter', f );
            sm.doTransition( 'next' );
            sm.doTransition( 'next' );
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'green' ) );
        });
        it( "should terminate transition with guards denying exit", function(){
            var orange = sm.getState( 'orange' );
            orange.addGuard( 'exit', function( ){return false } );
            sm.doTransition( 'next' );
            sm.doTransition( 'next' );
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'orange' ) );
        });

    });
    describe( "the automaton", function(){
        it( "should be configurable through an object", function(){
            var config = {
                "off" : {
                    isInitial : true,
                    "powerOn" : "on"
                },
                "off/standby" : {
                    isInitial : true
                },
                "off/kaput" : {},
                "off/kaput/fixable" :{
                    isInitial : true,
                    "fixed" : "off/standby"
                },
                "off/kaput/pertetotale":{},
                "on" : {
                    "powerOff" : "off",
                    "fail" : "off/kaput",
                    "vandalize" : "off/kaput/pertetotale"
                },
                "on/green" : {
                    isInitial : true,
                    "next" : "on/orange"
                },
                "on/orange" : {
                    "next" : "on/red"
                },
                "on/red" : {
                    "next" : "on/green"
                }
            };
            sm.parse( config );
            expect( sm.getCurrentState() ).toEqual( sm.getState('off/standby' ) );
            sm.doTransition( 'powerOn' );
            expect( sm.getCurrentState() ).toEqual( sm.getState('on/green' ) );
            sm.doTransition( 'next' );
            expect( sm.getCurrentState() ).toEqual( sm.getState('on/orange' ) );
            sm.doTransition( 'fail' );
            expect( sm.getCurrentState() ).toEqual( sm.getState('off/kaput/fixable' ) );
            sm.doTransition( 'fixed' );
            expect( sm.getCurrentState() ).toEqual( sm.getState('off/standby' ) );
            sm.doTransition( 'powerOn' );
            expect( sm.getCurrentState() ).toEqual( sm.getState('on/green' ) );
            sm.doTransition( 'vandalize' );
            expect( sm.getCurrentState() ).toEqual( sm.getState('off/kaput/pertetotale' ) );
        });
    });

    //TODO: move to spec.fsa.State
    describe( "a registered action", function(){
        var spy;
        var config = {
            "green" : { isInitial : true, "next" : "orange" },
            "orange" : { "next" : "red" },
            "red" : { "next" : "green" }
        };
        beforeEach( function(){
            spy = jasmine.createSpy( 'actionSpy' );
            sm.parse( config );
        });

        it( "should be called upon exit", function(){
            var green = sm.getState( 'green' );
            green.addAction( 'exit', spy );
            sm.doTransition( 'next' );
            expect( spy ).toHaveBeenCalled()
        });
        it( "should be called upon entry", function(){
            var orange = sm.getState( 'orange' );
            orange.addAction( 'enter', spy );
            sm.doTransition( 'next' );
            expect( spy ).toHaveBeenCalled()
        });
        it( "should receive an event object", function(){
            var orange = sm.getState( 'orange' );
            orange.addAction( 'enter', spy );
            sm.doTransition( 'next' );
            var e = {
                type : 'enter',
                from : 'green',
                to : 'orange'
            }
            expect( spy ).toHaveBeenCalledWith( e );
        });
        it( "should recieve a passed payload", function(){
            var orange = sm.getState( 'orange' );
            orange.addAction( 'enter', spy );
            var payload = {
                foo : "bar"
            }
            sm.doTransition( 'next', payload );
            var e = {
                type : 'enter',
                from : 'green',
                to : 'orange'
            };
            expect( spy ).toHaveBeenCalledWith( e, payload );

        });
    });

});