/**
 * @author Camille Reynders
 * Date: 08/03/12
 * Time: 11:44
 */
describe("jsfsa.Automaton", function(){
    "use strict";
    var sm;
    beforeEach( function(){
        sm = new jsfsa.Automaton();
    });
    beforeEach( function(){
        this.addMatchers({
            toBeInstanceOf : function( expected ){
                return this.actual instanceof expected;
            }
        });
    });
    afterEach( function(){
        sm.destroy();
        sm = undefined;
    });

    describe("instance", function(){
        it( "should be of type jsfsa.Automaton", function(){
            expect( sm ).toBeInstanceOf( jsfsa.Automaton );
        });
        it( "should have a root state", function(){
            expect( sm.getRootState() ).toBeInstanceOf( jsfsa.State );
        });
    });

    describe( "an added state", function(){
        it( "should be detectable", function (){
            var state = new jsfsa.State( 'foo' );
            sm.addState( state );
            expect( sm.hasState( state.name ) ).toBeTruthy();
        } );
        it( "should be removable", function(){
            var state = new jsfsa.State( 'foo' );
            sm
                .addState( state )
                .removeState( state.name )
            ;
            expect( sm.hasState( state.name ) ).toBeFalsy();
        });
        it( "should be retrievable", function(){
            var state = new jsfsa.State( 'foo' );
            sm.addState( state );
            expect( sm.getState( state.name ) ).toEqual( state );
        });
    });

    describe( "the automaton's basic operation", function(){
        beforeEach( function(){
            sm.createState( 'off', { transitions : { 'ignite' : 'on' }, isInitial : true } );
            sm.createState( 'on', { transitions : { 'shutdown' : 'off' } } );
        });
        it( "should allow to transition to another state", function(){
            sm.doTransition( 'ignite' );
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'on' ) );
        } );
        it( "should allow to transition back", function(){
            sm.doTransition( 'ignite' );
            sm.doTransition( 'shutdown' );
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'off' ) );
        } );
        it( "should fail silently if transition is not allowed", function(){
            sm.doTransition( 'ignite' );
            sm.doTransition( 'ignite' );
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'on' ) );
        });
        it( "should fail silently if a transition is not found", function(){
            sm.doTransition( 'ignite' );
            sm.doTransition( 'whatever' );
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'on' ) );
        });
        it( "should fail silently if a transition target is not found", function(){
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
        it( "should allow passing of any number of payload objects to exit guards", function(){
            var foo, bar;
            var off = sm.getState('off');
            off.addGuard( jsfsa.Action.EXIT, function( event, f, b ){
                foo = f;
                bar = b;
                return true;
            });

            sm.doTransition( 'ignite','foo','bar' );
            expect( [foo,bar] ).toEqual( ['foo','bar']);
        });
        it( "should allow passing of any number of payload objects to entry guards", function(){
            var foo, bar;
            var on = sm.getState('on');
            on.addGuard( jsfsa.Action.ENTRY, function( event, f, b ){
                foo = f;
                bar = b;
                return true;
            });

            sm.doTransition( 'ignite','foo','bar' );
            expect( [foo,bar] ).toEqual( ['foo','bar']);
        });
        it( "should allow passing of any number of payload objects to listeners", function(){
            var foo, bar;
            var on = sm.getState('on');
            on.addListener( jsfsa.StateEvent.ENTERED, function(event, f, b ){
                foo = f;
                bar = b;
            });

            sm.doTransition( 'ignite','foo','bar' );
            expect( [foo,bar] ).toEqual( ['foo','bar']);
        });
    });
    describe( "the automaton's out-of-state (w/o initial states)", function(){
        beforeEach( function(){
            sm.createState( 'off', { transitions : { 'ignite' : 'on' } } );
            sm.createState( 'on', { transitions : { 'shutdown' : 'off' } } );
        });
        it( "shouldn't allow transitioning to any state", function(){
            sm.doTransition( 'ignite' );
            expect( sm.getCurrentState() ).toEqual( sm.getRootState() );
            sm.doTransition( 'shutdown' );
            expect( sm.getCurrentState() ).toEqual( sm.getRootState() );
        } );
    });
    describe( "the automaton's non-binary, single-level state operation", function(){
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
                return false;
            };
            orange.addGuard( jsfsa.Action.ENTRY, f );
            sm.doTransition( 'next' );
            sm.doTransition( 'next' );
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'green' ) );
        });
        it( "should terminate transition with guards denying exit", function(){
            var orange = sm.getState( 'orange' );
            orange.addGuard( jsfsa.Action.EXIT, function( ){ return false; } );
            sm.doTransition( 'next' );
            sm.doTransition( 'next' );
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'orange' ) );
        });
    });
    describe( "the hiearachical automaton", function(){
        beforeEach( function(){
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
        });
        it( "should be configurable with an object", function(){
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
        it( "should allow for retrieval of the entire path to the current state", function(){
            sm.doTransition('powerOn');
            sm.doTransition('vandalize');
            expect( sm.getCurrentBranch() ).toEqual( [
                sm.getState('off'),
                sm.getState('off/kaput'),
                sm.getState('off/kaput/pertetotale')
            ]);
        });
        it( 'should allow for checking whether a state is part of the current branch', function(){
            sm.doTransition('powerOn');
            sm.doTransition('vandalize');
            expect( sm.isInCurrentBranch('on/red') ).toBe( false );
            expect( sm.isInCurrentBranch('off/kaput') ).toBe( true );
        });
    });

    describe( "the automaton's dispatcher", function(){
        beforeEach( function(){
            sm.createState( 'green',    { transitions : { 'next' : 'orange' }, isInitial : true } );
            sm.createState( 'orange',   { transitions : { 'next' : 'red'    } } );
            sm.createState( 'red',      { transitions : { 'next' : 'green'  } } );
        } );
        it( "should dispatch a exited event", function(){
            var spy = jasmine.createSpy( 'exited' );
            sm.addListener( jsfsa.StateEvent.EXITED, spy );
            sm.doTransition( 'next' );
            var e= new jsfsa.StateEvent( jsfsa.StateEvent.EXITED, 'green', 'orange', 'next' );
            expect( spy ).toHaveBeenCalledWith( e );
        });

        it( "should dispatch an entered event", function(){
            var spy = jasmine.createSpy( 'entered' );
            sm.addListener( jsfsa.StateEvent.ENTERED, spy );
            sm.doTransition( 'next' );
            var e= new jsfsa.StateEvent( jsfsa.StateEvent.ENTERED, 'green', 'orange', 'next' );
            expect( spy ).toHaveBeenCalledWith( e );
        });

        it( "should dispatch an entryDenied event", function(){
            var spy = jasmine.createSpy( 'entryDenied' );
            sm.addListener( jsfsa.StateEvent.ENTRY_DENIED, spy );
            var state = sm.getState('orange');
            state.addGuard( jsfsa.Action.ENTRY, function(){
                return false;
            });
            sm.doTransition( 'next' );
            var e= new jsfsa.StateEvent( jsfsa.StateEvent.ENTRY_DENIED, 'green', 'orange', 'next' );
            expect( spy ).toHaveBeenCalledWith( e );
        });

        it( "should dispatch an exitDenied event", function(){
            var spy = jasmine.createSpy( 'exitDenied' );
            sm.addListener( jsfsa.StateEvent.EXIT_DENIED, spy );
            var state = sm.getState('green');
            state.addGuard( jsfsa.Action.EXIT, function(){
                return false;
            });
            sm.doTransition( 'next' );
            var e= new jsfsa.StateEvent( jsfsa.StateEvent.EXIT_DENIED, 'green', 'orange', 'next' );
            expect( spy ).toHaveBeenCalledWith( e );
        });

        it( "should dispatch a changed event after transitioning has finished", function(){
            var spy = jasmine.createSpy( 'changed' );
            sm.addListener( jsfsa.StateEvent.CHANGED, spy );
            sm.doTransition( 'next' );
            var e= new jsfsa.StateEvent( jsfsa.StateEvent.CHANGED, 'green', 'orange', 'next' );
            expect( spy ).toHaveBeenCalledWith( e );
        });

        it( "should dispatch a transitionDenied event if the transition is not allowed", function(){
            var green = sm.getState( 'green' );
            sm.removeState( 'green' );
            green.isInitial = false;
            sm.addState( green );
            var spy = jasmine.createSpy( jsfsa.StateEvent.TRANSITION_DENIED );
            sm.addListener( jsfsa.StateEvent.TRANSITION_DENIED, spy );
            sm.doTransition( 'next' );
            var e= new jsfsa.StateEvent( jsfsa.StateEvent.TRANSITION_DENIED, sm.getRootState().name, undefined, 'next' );
            expect( spy ).toHaveBeenCalledWith( e );
        });
    });
    describe( "transition with action and guard", function(){
        beforeEach( function(){
            var vendingMachine = jasmine.createSpyObj('vendingMachine',
                                    [ 'calculatePrice', 'accumulate',
                                            'pricePayed', 'returnChange',
                                            'printTicket' ]);
            sm.vendingMachine = vendingMachine;
            sm.createState('idle', {
                transitions : {
                    'destinationSelected' : 'collectingMoney'
                },
                isInitial : true
            });
            sm.createState('collectingMoney', {
                listeners: {
                    entered: function(e, destination) {
                        vendingMachine.calculatePrice(destination);
                    }
                },
                transitions : {
                    'coinInserted' : function(e, amount) {
                        vendingMachine.accumulate(amount);
                        if(vendingMachine.pricePayed()) {
                            return 'printingTicket';
                        }
                    },
                    'cancel':  function(e, amount) {
                        vendingMachine.returnChange();
                    }
                }
            });
            sm.createState('printingTicket', {
                listeners: {
                    entered: function() {
                        vendingMachine.printTicket();
                    },
                    exited: function() {
                        vendingMachine.returnChange();
                    }
                },
                transitions : {
                    'ticketPrinted' : 'idle'
                }
            });
        } );
        it( "should execute an action before entering the target state", function(){
            var vendingMachine = sm.vendingMachine;
            sm.doTransition('destinationSelected', 'Main Station');
            expect( vendingMachine.calculatePrice ).toHaveBeenCalledWith('Main Station');
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'collectingMoney' ) );

            vendingMachine.pricePayed.andReturn(false);
            sm.doTransition('coinInserted', 200);
            expect( vendingMachine.accumulate ).toHaveBeenCalledWith(200);
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'collectingMoney' ) );

            vendingMachine.pricePayed.andReturn(true);
            sm.doTransition('coinInserted', 50);
            expect( vendingMachine.accumulate ).toHaveBeenCalledWith(50);
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'printingTicket' ) );

            sm.doTransition('ticketPrinted');
            expect( vendingMachine.returnChange ).toHaveBeenCalled();
            expect( sm.getCurrentState() ).toEqual( sm.getState( 'idle' ) );
            });
        });
// });
});
