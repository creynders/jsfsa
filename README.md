# FSA

FSA is an abbreviation for Finite State Automaton (or Automata), it is a small lib for creating 
asynchronous, non-deterministic, hierarchical finite-state machines in JavaScript.

[Find out more here](http://en.wikipedia.org/wiki/Finite-state_machine)

## Contact

You can contact me on Twitter with questions/remarks : [@camillereynders](http://twitter.com/camillereynders)

or send me a mail at:
info [at] creynders [dot] be

## Inspiration

FSA is inspired by the fsm's of 

* [Cássio S. Antonio](https://github.com/cassiozen/AS3-State-Machine)

* [Neil Manuell](http://statemachine.org/)

* [Jake Gordon](http://codeincomplete.com/posts/2012/1/7/javascript_state_machine_v2_1_0/)

## Resources

[API documentation](http://creynders.github.com/fsa/docs)

## Dependencies

FSA has no dependencies on other frameworks. 
[jasmine](https://github.com/pivotal/jasmine) is used for testing.

## FEATURES

* Framework independent: doesn't rely on any other 3rd party frameworks.

* Framework integration: easily used on top of other frameworks.

* Hierarchical states: states can be configured to have an unlimited number of substates, an unlimited number of levels deep.

* Guards: an unlimited amount of callbacks can be set to guard both entry and exit of states.

* Actions: an unlimited amount of callbacks can be executed on both entry and exit of states.

* Granular: both state-specific event listening and automaton-wide event listening is possible.

## TODO

* Optimize and refactor. FSA's gone through various implementations and though I tried to keep it clean and lean, there's definitely a ton of stuff that can be optimized. At the moment I concentrated more on the API than on the actual implementation.

* Tests: although I tried to create all tests I could think of, there's undoubtedly a large amount of (unwanted) behaviours that still need to be tested.

* Docs: the API documentation needs to be completed.

* Demo: a working demo should be created.

## EXAMPLES

### BASIC USAGE

* classy config

```
var offState = new fsa.State( 'off' )
	.addTransition( 'ignite', 'on' )
	.isInitial = true
;
var onState = new fsa.State( 'on' )
	.addTransition( 'shutdown', 'off' )
;

var fsm = new fsa.Automaton()
	.addState( offState )
	.addState( onState )
	.doTransition( 'ignite' )
;
console.log( fsm.getCurrentState().name );//outputs 'on'
```

* per-state strict-syntax object config

```
var offState = new State( 'off', {
	transitions : {
		'ignite' : 'on'
	},
	isInitial : true
} );
var onState = new fsa.State( 'on', {
	transitions : {
		'shutdown' : 'off'
	}
} );
var fsm = new fsa.Automaton()
	.addState( offState )
	.addState( onState )
	.doTransition( 'ignite' )
;
console.log( fsm.getCurrentState().name );//outputs 'on'
```

* per-state loose-syntax object config

```
var offState = new State( 'off', {
	'ignite' : 'on'
	isInitial : true
} );
var onState = new fsa.State( 'on', {
	'shutdown' : 'off'
} );
var fsm = new fsa.Automaton()
	.addState( offState )
	.addState( onState )
	.doTransition( 'ignite' )
;
console.log( fsm.getCurrentState().name );//outputs 'on'
```

* fsm loose-syntax object config

```
var config = {
	'off' : {
		'ignite' : 'on'
		isInitial : true
	},
	'on' : {
		'shutdown' : 'off'
	}
};
var fsm = new fsa.Automaton( config )
	.doTransition( 'ignite' )
;
console.log( fsm.getCurrentState().name );//outputs 'on'
```

### GUARDS, ACTIONS and NESTED STATES

* you can config nesting by defining a full path in the state's name
* actions are executed upon entrance or exit of a state, they are non-blocking
* guards control entries and exits of states, they need to return a true to continue transition
or falsy to block it.
* execution order:
** exit guards
** entry guards
** exit actions
** entry actions

a falsy returning guard will prohibit further execution of guards and actions down the line

```
var config = {
	"off" : {
		isInitial : true,
		"powerOn" : "on"
	},
	"off/standby" : {
		isInitial : true
	},
	"off/kaput" : {
		actions : {
			enter : function(){
			 	//executed when this state is entered
				console.error( "damn thing's broken" );
			},
			exit : function(){
				//executed when this state is left
				console.log( "this fine piece of machinery's working again" );
			}
		}
	},
	"off/kaput/fixable" :{
		isInitial : true,
		"fixed" : "off/standby"
	},
	"off/kaput/pertetotale":{
		guards : {
			exit : function(){
				//executed when the fsm is determining whether it's allowed to transition state
				console.log( "it's no use, just throw it away!" );
				return false; //prohibits further transitioning
			}
		}
	},
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
```

### ASYNCHRONOUS STATE TRANSITIONS

* the FSA can be commanded to pause and resume transitioning to allow for asynchronous state transitions

```
var fsm;
var config = {
	"green" : { 
		isInitial : true,
		actions : { 
			exit : function(){
				fsm.pause(); //sets the fsm in a waiting state
				setTimeout( 500, function(){
					fsm.proceed(); //automaton proceeds transitioning to "orange" state
				} );
			}
		},
		"next" : "orange" 
	},
	"orange" : { "next" : "red" },
	"red" : { "next" : "green" }
};
fsm = new fsa.Automaton( config )
	.doTransition( 'next' )
;
```