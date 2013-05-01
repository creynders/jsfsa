# JSFSA [![Build Status](https://secure.travis-ci.org/creynders/jsfsa.png?branch=master)](http://travis-ci.org/creynders/jsfsa)

JSFSA is an abbreviation for JavaScript Finite State Automaton (or Automata), it is a small lib for creating 
asynchronous, non-deterministic, hierarchical finite-state machines in JavaScript.

[Find out more here](http://en.wikipedia.org/wiki/Finite-state_machine)

## Status

JSFSA is in a stable state. The reason why it's not v1.x yet is because I want to nail down the API first.

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

[API documentation](http://creynders.github.com/jsfsa)

## Examples

### BASIC USAGE

* classy config

```
var offState = new jsfsa.State( 'off' )
	.addTransition( 'ignite', 'on' )
	.isInitial = true
;
var onState = new jsfsa.State( 'on' )
	.addTransition( 'shutdown', 'off' )
;

var fsm = new jsfsa.Automaton()
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
var onState = new jsfsa.State( 'on', {
	transitions : {
		'shutdown' : 'off'
	}
} );
var fsm = new jsfsa.Automaton()
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
var onState = new jsfsa.State( 'on', {
	'shutdown' : 'off'
} );
var fsm = new jsfsa.Automaton()
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
var fsm = new jsfsa.Automaton( config )
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
var fsm = new jsfsa.Automaton( config )
	.doTransition( 'ignite' )
;
console.log( fsm.getCurrentState().name );//outputs 'off'
```

### LISTENERS

There are 4 events that can be listened to, either directly on a state instance or on the statemachine instance itself:
'entered', 'exited', 'entryDenied', 'exitDenied'.
The automaton dispatches 2 additional events: 'transitionDenied', dispatched if the transition name was not registered for the 
current state or if the transition target could not've been found and 'changed', dispatched after a transition has been completed. 

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
var fsm = new jsfsa.Automaton( config )
	.doTransition( 'ignite' )
;
//output in console:
//exited from off to on
//entered from off to on
```

* On the automaton:

```
//loose syntax
var outputEvent = function( e ){
	console.log( e.type + ' from ' + e.from + ' to ' + e.to );
}
var config = {
	'off' : {
		'ignite' : 'on',
		isInitial : true
	},
	'on' : {
		'shutdown' : 'off'
	}
};
var fsm = new jsfsa.Automaton( config )
	.addListener( jsfsa.StateEvent.CHANGED, outputEvent )
	.doTransition( 'ignite' )
;
//output in console:
//changed from off to on
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
fsm = new jsfsa.Automaton( config )
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
var fsm = new jsfsa.Automaton( config )
	.doTransition( 'ignite', 'foo' )
;
```

### DYNAMIC TRANSITIONS WITH GUARDS AND EFFECTS

So far we have seen examples for statically defined transition targets. However,  transitions can also be dynamic, i.e. the transition itself can be conditional, transitions can have an effect and it is possible to determine the target state of a transition based on some calculation within the transition. The event handler has access to payload data.

#### GUARDS AND EFFECTS

* transitions can be guarded by a condition and they can have an effect. As an example, this transition might occur in a simplified football game statemachine:

```
    goal[valid]/goals++      +----------+
---------------------------> | kickOff  |
                             +----------+
```

When a goal occurs, the effect is that the goals count is increased, but only if the goal is valid. Afterwards the game will be in the kickOff state.

This can be especially useful if there are different effects depending on the event and the condition which brings you to a new state. E.g. you can have one state kickOff which only contains the entry acttions that are common to all kickOffs, rather than distinguishing a kickOffAfterGoal which increases the goal count in its entry action from a kickOffAtBeginning and a kickOffAfterHalftime which don't do that.

For such a guarded transition with effect, define a function as the transition target and return the name of the target state if you want to allow the transition.

```
    ...
    transitions : {
        'goal' : function(e, valid) {
            if(valid === true) {
                goals++;
                return 'kickOff';
            } 
        }
    }
    ...

    // a valid goal occurs:
    sm.doTransition('goal', true)
```

Note that the function returns the target state 'kickOff' if the goal was valid, but it returns undefined if the goal was not valid. In the latter case, the transition is denied and we stay in the current state.

#### INTERNAL TRANSITIONS

* you can also have an internal transition, i.e. you can handle an event without ever leaving a state.

```
    +-----------------------------------------------+
    |      Entering password                        |
    +-----------------------------------------------+
    | passwordEntered[invalid]/failed++             |
    |                                               |
    +-----------------------------------------------+
```

For such an internal transition the event handler function must always return undefined.

```
    ...
    transitions : {
        'passwordEntered' : function(e, password) {
            if(!passwordValid(password) {
                failed++;
            }
            return undefined;
        }
    }
    ...

    // wrong password:
    sm.doTransition('passwordEntered', 'wr0n5')
```

#### DYNAMIC CHOICES

Finally, this technique also allows you to express a choice, i.e. a transition whose target is determined dynamically. Consider the transitions below which describe what happens if a team scores a goal during a football match in tie state.

```
                   +-----------+
                   |    Tie    |
                   +-----------+
                         |
                         | goal
                        / \
                    __ /   \__
                   |   \   /  |
        [homeTeam] |    \ /   |[visitingTeam]
 /goals.homeTeam++ |          |  /goals.visitingTeam++
                   |          | 
    +----------+<--*          *-->+----------+ 
    |  Lead    |                  | Lead     |
    |  Home    |                  | Visiting |
    |  Team    |                  | Team     |
    +----------+                  +----------+
```

The goal event can lead to two different transitions. The transition from Tie to LeadHomeTeam occurs only if the goal was scored by the home team. It effectively increments the goals of the home team (and vice versa). For such a choice, you could write:

```
    ...
    transitions : {
        'goal' : function(e, scorer) {
            goals[scorer]++;
            if(scorer === 'homeTeam') {
                return 'leadHomeTeam';
            } else {
                return 'leadVisitingTeam';
            }
        }
    }
     ...
    // The home team scores a goal:
    sm.doTransition('goal', 'homeTeam')
```

## Dependencies

### USAGE

JSFSA has no dependencies on other frameworks. 

### BUILD

* [Grunt](http://gruntjs.com/): JS Task Runner

## Inspiration

JSFSA is inspired by the fsm's of 

* [Cássio S. Antonio](https://github.com/cassiozen/AS3-State-Machine)
* [Neil Manuell](http://statemachine.org/)
* [Jake Gordon](http://codeincomplete.com/posts/2012/1/7/javascript_state_machine_v2_1_0/)

## TODO

* Optimize and refactor. JSFSA's gone through various implementations and though I tried to keep it clean and lean, there's definitely a ton of stuff that can be optimized. At the moment I concentrated more on the API than on the actual implementation.
* Tests: although I tried to create all tests I could think of, there's undoubtedly a large amount of (unwanted) behaviours that still need to be tested.
* Docs: the API documentation needs to be completed.
* Demo: a working demo should be created.

