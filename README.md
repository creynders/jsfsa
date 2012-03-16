# JSFSA

JSFSA is an abbreviation for JavaScript Finite State Automaton (or Automata), it is a small lib for creating 
asynchronous, non-deterministic, hierarchical finite-state machines in JavaScript.

[Find out more here](http://en.wikipedia.org/wiki/Finite-state_machine)

## Features

* __Hierarchical states__: states can be configured to have an unlimited number of substates, an unlimited number of levels deep.
* __Guards__: an unlimited amount of callbacks can be set to guard both entry and exit of states.
* __Listeners__: an unlimited amount of callbacks can be executed on both entry and exit of states.
* __Named transitions__: switching of states happens through named transitions.
* __Asynchronous transitioning__: transitioning from one state to the other can be paused/resumed.
* __Framework independent__: doesn't rely on any other 3rd party frameworks.

## Contact

You can contact me on Twitter with questions/remarks : [@camillereynders](http://twitter.com/camillereynders)

or send me a mail at:
info [at] creynders [dot] be

## Resources

[API documentation](http://creynders.github.com/jsfsa/docs)

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
	'ignite' : 'on',
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
		'ignite' : 'on',
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

### GUARDS

Guards control entries and exits of states, they need to return a ```true``` to continue transition. Anything falsy will terminate the transition.

```
//loose syntax
var blockEntry = function(){
	return false;
}

var config = {
	'off' : {
		'ignite' : 'on',
		isInitial : true
	},
	'on' : {
		guards : {
			entry : blockEntry
		},
		'shutdown' : 'off'
	}
};
var fsm = new fsa.Automaton( config )
	.doTransition( 'ignite' )
;
console.log( fsm.getCurrentState().name );//outputs 'off'
```

### LISTENERS

There are 4 events that can be listened to, either directly on a state instance or on the statemachine instance itself.

* On the state:

```
//loose syntax
var outputEvent = function( e ){
	console.log( e.type + ' from ' + e.from + ' to ' + e.to );
}

var config = {
	'off' : {
		listeners : {
			exited : outputEvent
		},
		'ignite' : 'on',
		isInitial : true
	},
	'on' : {
		listeners : {
			entered : outputEvent
		},
		'shutdown' : 'off'
	}
};
var fsm = new fsa.Automaton( config )
	.doTransition( 'ignite' )
;
//output in console:
//exited from off to on
//entered from off to on
```

* On the automaton:

```
//loose syntax
var blockEntry = function(){
	return false;
}
var outputEvent = function( e ){
	console.log( e.type + ' from ' + e.from + ' to ' + e.to );
}
var config = {
	'off' : {
		'ignite' : 'on',
		isInitial : true
	},
	'on' : {
		guards : {
			entry : blockEntry
		},
		'shutdown' : 'off'
	}
};
var fsm = new fsa.Automaton( config )
	.addListener( fsa.StateEvent.ENTRY_DENIED, outputEvent )
	.doTransition( 'ignite' )
;
//output in console:
//entryDenied from off to on
```

### NESTED STATES

* You can define nesting by providing a full path in the state's name

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
	},
	"off/kaput/fixable" :{
		isInitial : true,
		"fixed" : "off/standby"
	},
	"off/kaput/pertetotale":{
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

* If you prefer not to have the hierarchy reflected in the state names, you can use the parent property to define the parent state

```
var config = {
	"off" : {
		isInitial : true,
		"powerOn" : "on"
	},
	"standby" : {
		parent : "off"
		isInitial : true
	},
	"kaput" : {
		parent : "off"
	},
	"fixable" :{
		parent : "kaput",
		isInitial : true,
		"fixed" : "standby"
	},
	"pertetotale":{
		parent : "kaput"
	},
	"on" : {
		"powerOff" : "off",
		"fail" : "kaput",
		"vandalize" : "pertetotale"
	},
	"green" : {
		parent : "on",
		isInitial : true,
		"next" : "orange"
	},
	"orange" : {
		parent : "on",
		"next" : "red"
	},
	"red" : {
		parent : "on"
		"next" : "green"
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
		listeners : { 
			exited : function(){
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

### PAYLOAD PASSING

* payloads passed to the ```doTransition``` method are automatically passed to all guards and listeners

```
var config = {
	'off' : {
		'ignite' : 'on'
		isInitial : true,
		listeners : {
			exited : function( e, payload ){
				console.log( payload ); //outputs 'foo'
			}
		}
	},
	'on' : {
		'shutdown' : 'off'
	}
};
var fsm = new fsa.Automaton( config )
	.doTransition( 'ignite', 'foo' )
;
```

## Dependencies

### Usage

JSFSA has no dependencies on other frameworks. 

### Building

* [Apache Ant](http://ant.apache.org/): build scripting
* [Jasmine](https://github.com/pivotal/jasmine): unit testing (incl.)
* [JSDoc Toolkit](http://code.google.com/p/jsdoc-toolkit/): API documentation generation (incl.)
* [JSHint](http://www.jshint.com/): JS code QA (incl.)
* [YUI Compressor](http://developer.yahoo.com/yui/compressor/): Minification (incl.)
* [PhantomJS](http://www.phantomjs.org/): Headless Webkit


## Inspiration

JSFSA is inspired by the fsm's of 

* [Cássio S. Antonio](https://github.com/cassiozen/AS3-State-Machine)
* [Neil Manuell](http://statemachine.org/)
* [Jake Gordon](http://codeincomplete.com/posts/2012/1/7/javascript_state_machine_v2_1_0/)

## TODO

* Optimize and refactor. FSA's gone through various implementations and though I tried to keep it clean and lean, there's definitely a ton of stuff that can be optimized. At the moment I concentrated more on the API than on the actual implementation.
* Tests: although I tried to create all tests I could think of, there's undoubtedly a large amount of (unwanted) behaviours that still need to be tested.
* Docs: the API documentation needs to be completed.
* Demo: a working demo should be created.

