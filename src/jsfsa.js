var jsfsa;
/**
 * @author Camille Reynders
 * @version @@version
 */
(function (pkg) {
    "use strict";

    //--( Dispatcher )--//

    var Dispatcher = function () {
        this._listeners = {};
    };

    /**
     * Registers a <code>handler</code> function to be called when an event with <code>eventName</code> is dispatched.
     * The <code>handler</code> is called within the scope of the dispatcher.
     * @param {String} eventName
     * @param {Function} handler
     * @return {Object} the dispatcher
     */
    Dispatcher.prototype.addListener = function (eventName, handler) {
        if (!this._listeners.hasOwnProperty(eventName)) {
            this._listeners[eventName] = [];
        }
        this._listeners[eventName].push(handler);

        return this;
    };

    /**
     * Registers several <code>handlers</code> for an event with name <code>eventName</code>
     * @param {String} eventName
     * @param {Function} handlers
     * @return {Object} the dispatcher
     */
    Dispatcher.prototype.addListeners = function (eventName, handlers) {
        if (typeof handlers === "function") {
            return this.addListener(eventName, handlers);
        }

        var arr;
        if (!this._listeners.hasOwnProperty(eventName)) {
            arr = [];
        } else {
            arr = this._listeners[eventName];
        }

        this._listeners[eventName] = arr.concat(handlers);

        return this;
    };

    /**
     * Checks whether the dispatcher has a specific <code>handler</code> registered for <code>eventName</code>
     * @param {String} eventName
     * @param {Function} handler
     * @return {Boolean}
     */
    Dispatcher.prototype.hasListener = function (eventName, handler) {
        if (this._listeners.hasOwnProperty(eventName)) {
            var index = this._listeners[eventName].indexOf(handler);
            return index >= 0;
        }
        return false;
    };
    /**
     * Unregisters a <code>handler</code> for <code>eventName</code>
     * @param {String} eventName
     * @param {Function} handler
     * @return {Object} the dispatcher
     */
    Dispatcher.prototype.removeListener = function (eventName, handler) {
        if (this._listeners.hasOwnProperty(eventName)) {
            var index = this._listeners[eventName].indexOf(handler);
            if (index >= 0) {
                this._listeners[eventName].splice(index, 1);
            }
        }
        return this;
    };

    /**
     * Dispatches an event.
     * @param {Object} e
     * @param {String} e.type
     * @return {Boolean} the result of the registered handlers
     */
    Dispatcher.prototype.dispatch = function (e) {
        var eventName = e.type;
        var result = true;
        if (this._listeners.hasOwnProperty(eventName)) {
            var args = Array.prototype.slice.call(arguments);
            for (var i = 0, n = this._listeners[eventName].length; i < n; i++) {
                var handler = this._listeners[eventName][i];
                result = handler.apply(this, args) && result;
            }
        }
        return result;
    };

    //--( DispatcherProxy )--//

    var DispatcherProxy = function () {};
    DispatcherProxy.prototype = Dispatcher.prototype;

    //--( StateEvent )--//

    /**
     * @class
     * @constructor
     * @param {String} type
     * @param {String} from name of the exiting/exited state
     * @param {String} to name of the entering/entered state
     * @param {transition} transition name of the transition
     */
    var StateEvent = function (type, from, to, transition) {

        /**
         * @type String
         */
        this.fqn = 'jsfsa.StateEvent';

        /**
         * The name of the dispatched event.
         * @see jsfsa.StateEvent.ENTERED
         * @see jsfsa.StateEvent.EXITED
         * @see jsfsa.StateEvent.ENTRY_DENIED
         * @see jsfsa.StateEvent.EXIT_DENIED
         * @see jsfsa.StateEvent.TRANSITION_DENIED
         * @see jsfsa.StateEvent.CHANGED
         * @type String
         */
        this.type = type;

        /**
         * The name of the state we're (trying to) transition from.
         * @type String
         */
        this.from = from;

        /**
         * The name of the state we're (trying to) transition to.
         * @type String
         */
        this.to = to;

        /**
         * The name of the transition.
         * @type String
         */
        this.transition = transition;
    };

    /**
     * Dispatched when a state has been entered
     * @static
     * @const
     * @default 'entered'
     */
    StateEvent.ENTERED = 'entered';

    /**
     * Dispatched when a state has been exited
     * @static
     * @const
     * @default 'exit'
     */
    StateEvent.EXITED = 'exited';

    /**
     * Dispatched when entry to a state has been denied by a guard
     * @static
     * @const
     * @default 'entryDenied'
     */
    StateEvent.ENTRY_DENIED = 'entryDenied';

    /**
     * Dispatched when exit from a state has been denied by a guard.
     * @static
     * @const
     * @default 'exitDenied'
     */
    StateEvent.EXIT_DENIED = 'exitDenied';

    /**
     * Dispatched when the current state has no transition with the specified name
     * or if the <code>to</code> state was not found.</br>
     * This event is only dispatched by {@link jsfsa.Automaton}
     * @static
     * @const
     * @default 'transitionDenied'
     */
    StateEvent.TRANSITION_DENIED = 'transitionDenied';

    /**
     * Dispatched after transitioning has completely finished.
     * @static
     * @const
     * @default 'changed'
     */
    StateEvent.CHANGED = 'changed';

    /**
     * @return {jsfsa.StateEvent}
     */
    StateEvent.prototype.clone= function () {
        var result = new StateEvent(this.type, this.from, this.to, this.transition);
        return result;
    };

    /**
     * @private
     * @param type
     */
    StateEvent.prototype._setType= function (type) {
        this.type = type;
        return this;
    };

    //--( Action )--//

    /**
     * @class
     * @constructor
     */
    var Action = function () {};

    /**
     * @static
     * @const
     * @default 'entry'
     */
    Action.ENTRY = 'entry';

    /**
     * @static
     * @const
     * @default 'exit'
     */
    Action.EXIT = 'exit';

    //--( State )--//

    /**
     * @class
     * @constructor
     * @borrows Dispatcher#addListener as this.addListener
     * @borrows Dispatcher#addListeners as this.addListeners
     * @borrows Dispatcher#removeListener as this.removeListener
     * @borrows Dispatcher#hasListener as this.hasListener
     * @borrows Dispatcher#dispatch as this.dispatch
     * @param {String} name
     * @param {Object} [data] object with configuration data, see {@link jsfsa.State#parseData} for syntax
     */
    var State = function (name, data) {
        Dispatcher.call(this);

        /**
         * @type String
         */
        this.fqn = 'jsfsa.State';

        /**
         * The name of the state
         * @type String
         */
        this.name = '';

        /**
         * Name of the parent state
         * @type String
         */
        this.parent = undefined;

        /**
         * Whether this state will be used as the initial state of the {@link jsfsa.State#parent}
         * @type Boolean
         */
        this.isInitial = false;

        /**
         * @private
         * @type Dispatcher
         */
        this._guardian = undefined;

        /**
         * @private
         * @type {Object}
         */
        this._transitions = {};

        this._parseName(name);
        this.parseData(data);
    };

    State.prototype = new DispatcherProxy();
    State.prototype.constructor = State;

    /**
     * @private
     * @type {Array}
     */
    State._configMembers = ['isInitial', 'guards', 'listeners', 'parent', 'transitions'];

    /**
     * Tells this state to allow a transition with name <code>transitionName</code> from this state to <code>stateName</code></br>
     * Overwrites transitions with the same name already registered with this state.
     * @see jsfsa.State#removeTransition
     * @see jsfsa.State#hasTransition
     * @see jsfsa.State#getTransition
     * @param {String} transitionName
     * @param {String} stateName
     * @return {jsfsa.State} the instance of {@link jsfsa.State} that is acted upon
     */
    State.prototype.addTransition = function (transitionName, stateName) {
        this._transitions[transitionName] = stateName;
        return this;
    };

    /**
     * Removes a registered transition with name <code>transitionName</code>. Fails silently if such a transition was not found.
     * @see jsfsa.State#addTransition
     * @see jsfsa.State#hasTransition
     * @see jsfsa.State#getTransition
     * @param {String} transitionName
     * @return {jsfsa.State} the instance of {@link jsfsa.State} that is acted upon
     */
    State.prototype.removeTransition = function (transitionName) {
        delete this._transitions[transitionName];
        return this;
    };

    /**
     * Retrieves the name of the state that will be transitioned with <code>transitionName</code>
     * @see jsfsa.State#addTransition
     * @see jsfsa.State#hasTransition
     * @see jsfsa.State#removeTransition
     * @param {String} transitionName
     * @return {String} target state name
     */
    State.prototype.getTransition = function (transitionName) {
        return this._transitions[transitionName];
    };

    /**
     * Checks whether a transition with <code>transitionName</code> has been registered for this state.
     * @see jsfsa.State#addTransition
     * @see jsfsa.State#getTransition
     * @see jsfsa.State#removeTransition
     * @param {String} transitionName
     * @return {Boolean}
     */
    State.prototype.hasTransition = function (transitionName) {
        return this._transitions.hasOwnProperty(transitionName);
    };

    /**
     * Sets up <code>guard</code> to be called if entry/exit of a state has been requested.</br>
     * The <code>guard</code> should return <code>true</code> to allow the <code>action</code> to happen.
     * Anything <code>falsy</code> will deny transition to/from this state.</br>
     * The <code>guard</code> receives a {@link jsfsa.StateEvent} object as a first parameter.
     * @see jsfsa.State#addGuards
     * @see jsfsa.State#hasGuard
     * @see jsfsa.State#removeGuard
     * @param {String} action One of the static property values of {@link jsfsa.Action}
     * @param {Function} guard
     * @return {jsfsa.State} the instance of {@link jsfsa.State} that is acted upon
     */
    State.prototype.addGuard = function (action, guard) {
        this._getGuardian()
            .addListener(action, guard);
        return this;
    };

    /**
     * Registers multiple <code>guards</code> to be called on <code>action</code>
     * @see jsfsa.State#addGuard
     * @see jsfsa.State#hasGuard
     * @see jsfsa.State#removeGuard
     * @param {String} action One of the static property values of {@link jsfsa.Action}
     * @param {Function[]} guards
     * @return {jsfsa.State} the instance of {@link jsfsa.State} that is acted upon
     */
    State.prototype.addGuards = function (action, guards) {
        this._getGuardian()
            .addListeners(action, guards);
        return this;
    };

    /**
     * Checks if a <code>guard</code> has been registered to control transitioning to/from this state.
     * @see jsfsa.State#addGuard
     * @see jsfsa.State#addGuards
     * @see jsfsa.State#removeGuard
     * @param {String} action One of the static property values of {@link jsfsa.Action}
     * @param {Function} guard
     * @return {Boolean}
     */
    State.prototype.hasGuard = function (action, guard) {
        return this._guardian && this._guardian.hasListener(action, guard);
    };

    /**
     * Unregisters a <code>guard</code> for <code>action</code>
     * @see jsfsa.State#addGuard
     * @see jsfsa.State#addGuards
     * @see jsfsa.State#hasGuard
     * @param {String} action One of the static property values of {@link jsfsa.Action}
     * @param {Function} guard
     * @return {jsfsa.State} the instance of {@link jsfsa.State} that is acted upon
     */
    State.prototype.removeGuard = function (action, guard) {
        if (this._guardian) {
            this._guardian.removeListener(action, guard);
        }
        return this;
    };

    /**
     * Parses the <code>data</code> to configure the state.
     * @example //Strict syntax
    var guard = function( e ){
        return false;
    };
    var listener = function( e ){
        console.log( e );
    }
    var config = {
        isInitial : true,
        transitions : {
            'ignite' : 'on', //transitionName : targetStateName
            'fail' : 'broken'
        },
        guards : {
            entry : [ guard ],
            exit : [ guard ]
        },
        listeners : {
            entryDenied : [ listener ],
            entered : [ listener ],
            exitDenied : [ listener ],
            exited : [ listener ]
        }
    }
     * @example //Loose syntax
    var guard = function( e ){
        return false;
    };
    var listener = function( e ){
        console.log( e );
    }
    var config = {
        isInitial : true,
        'ignite' : 'on', //transitionName : targetStateName
        'fail' : 'broken'
        guards : {
            entry : guard,
            exit : guard
        },
        listeners : {
            entryDenied : listener,
            entered : listener,
            exitDenied : listener,
            exited : listener
        }
    }
     * @param {Object} data
     */
    State.prototype.parseData = function (data) {
        if (data) {
            if (data.isInitial) {
                this.isInitial = true;
            }
            if (data.guards) {
                if (data.guards[Action.ENTRY]) {
                    this.addGuards(Action.ENTRY, data.guards[Action.ENTRY]);
                }
                if (data.guards[Action.EXIT]) {
                    this.addGuards(Action.EXIT, data.guards[Action.EXIT]);
                }
            }
            for (var eventName in data.listeners) {
                if (data.listeners.hasOwnProperty(eventName)) {
                    this.addListeners(eventName, data.listeners[eventName]);
                }
            }
            if (data.parent) {
                this.parent = data.parent;
            }
            if (data.transitions) {
                this._addTransitions(data.transitions);
            }

            this._addTransitions(data, State._configMembers);
        }
    };

    /**
     * Releases all resources. After calling this method, the State instance can/should no longer be used.
     */
    State.prototype.destroy = function () {
        this._guardian = undefined;
        this._transitions = undefined;
        this._listeners = undefined;
        this.name = undefined;
    };

    /**
     *
     * @return {Dispatcher}
     * @private
     */
    State.prototype._getGuardian = function () {
        if (this._guardian === undefined) {
            this._guardian = new Dispatcher();
        }
        return this._guardian;
    };

    State.prototype._parseName = function (name) {
        var index = name.lastIndexOf('/');
        if (index >= 0) {
            this.parent = name.substring(0, index);
        }
        this.name = name;
    };

    State.prototype._executeGuards = function (args) {
        var result = true;
        if (this._guardian) {
            result = this._guardian.dispatch.apply(this._guardian, args);
            if (!result) {
                args = args.slice(0);
                var e = args[0].clone();
                e.type += 'Denied';
                args[0] = e;
                this.dispatch.apply(this, args);
            }
        }

        return result;
    };

    /**
     * @private
     * @param {Object} data
     * @param {String[]} [skip]
     */
    State.prototype._addTransitions = function (data, skip) {
        for (var transitionName in data) {
            if (data.hasOwnProperty(transitionName)) {
                if (skip && skip.indexOf(transitionName) >= 0) {
                    continue;
                }
                this.addTransition(transitionName, data[transitionName]);
            }
        }
    };

    /**
     * @private
     * @param {Array} args
     */
    State.prototype._dispatchArgs = function (args) {
        this.dispatch.apply(this, args);
    };

    //--( Node )--//

    /**
     * @ignore
     * @class
     * @constructor
     * @param state
     */
    var Node = function (state) {
        this.state = state;
        this.parent = undefined;
        this.children = undefined;
        this.initialChild = undefined;
    };

    Node.prototype = {

        /**
         * @ignore
         * @param node
         */
        addChild: function (node) {
            if (!this.children) {
                this.children = {};
            }
            node.parent = this;
            if (node.state.isInitial) {
                this.initialChild = node;
            }
            this.children[node.state.name] = node;
        },
        /**
         * @ignore
         * @param node
         */
        removeChild: function (node) {
            if (this.initialChild === node) {
                this.initialChild = undefined;
            }
            delete this.children[node.state.name];
        },
        /**
         * @ignore
         */
        destroy: function () {
            for (var stateName in this.children) {
                if (this.children.hasOwnProperty(stateName)) {
                    this.children[stateName].destroy();
                }
            }
            this.state = undefined;
            this.parent = undefined;
            this.children = undefined;
        },
        /**
         * @ignore
         */
        getInitialBranch: function () {
            var result = [];
            var initial = this.initialChild;
            while (initial) {
                result.push(initial);
                initial = initial.initialChild;
            }

            return result;
        }
    };

    //--( StateEventFactory )--//

    /**
     * @ignore
     * @class
     * @constructor
     * @param {String} transition
     * @param {String} from
     * @param {String} to
     */
    var StateEventFactory = function (payload, transition, from, to) {
        this.payload = payload;
        this.from = from;
        this.to = to;
        this.transition = transition;
    };

    StateEventFactory.prototype = {
        /**
         * @ignore
         * @param type
         * @return {jsfsa.StateEvent}
         */
        createEvent: function (type) {
            return new StateEvent(type, this.from, this.to, this.transition);
        },

        createArgsArray: function (type) {
            var result = this.payload.slice(0);
            result.unshift(this.createEvent(type));
            return result;
        }
    };

    //--( Automaton )--//

    /**
     * @class
     * @constructor
     * @borrows Dispatcher#addListener as this.addListener
     * @borrows Dispatcher#addListeners as this.addListeners
     * @borrows Dispatcher#removeListener as this.removeListener
     * @borrows Dispatcher#hasListener as this.hasListener
     * @borrows Dispatcher#dispatch as this.dispatch
     */
    var Automaton = function (data, name) {
        Dispatcher.call(this);
        /**
         * @type String
         */
        this.fqn = 'jsfsa.Automaton';

        this.name = name || '';

        this._nodes = {};
        this._rootNode = new Node(new State('root'));
        this._currentBranch = [this._rootNode];
        this._internalState = 'ready';
        this._queue = [];
        this._newBranch = undefined;
        if (data) {
            this.parse(data);
        }
    };

    Automaton.prototype = new DispatcherProxy();
    Automaton.prototype.constructor = Automaton;

    /**
     * Returns whether the Automaton is currently transitioning from one state to the other
     * @return {Boolean}
     */
    Automaton.prototype.isTransitioning = function () {
        return this._internalState !== 'ready';
    };

    /**
     * @private
     * @return {jsfsa.State}
     */
    Automaton.prototype.getRootState = function () {
        return this._rootNode.state;
    };

    /**
     * Returns the lowest state that is currently active
     * @return {jsfsa.State}
     */
    Automaton.prototype.getCurrentState = function () {
        return this._currentBranch[this._currentBranch.length - 1].state;
    };

    /**
     * Returns a top-down list of the currently active hierarchical states
     * @return {jsfsa.State[]}
     */
    Automaton.prototype.getCurrentBranch = function () {
        var branch = this._currentBranch;
        var output = [];
        //we're skipping the root node!
        for (var i = 1; i < branch.length; i++) {
            var node = branch[i];
            output.push(node.state);
        }
        return output;
    };

    /**
     * Checks whether a state with name <code>statename</code> is currently active
     * @param stateName
     * @return {Boolean}
     */
    Automaton.prototype.isInCurrentBranch = function (stateName) {
        var node = this._nodes[stateName];
        if (node) {
            return this._currentBranch.indexOf(node) > -1;
        }
        return false;
    };

    /**
     * Creates a state and adds it to the Automaton
     * @param {String} stateName
     * @param {Object} stateData
     * @return {jsfsa.Automaton} the instance of {@link jsfsa.Automaton} that is acted upon
     */
    Automaton.prototype.createState = function (stateName, stateData) {
        var state = new State(stateName, stateData);
        this.addState(state);

        return this;
    };

    /**
     * Adds a state to the Automaton
     * @param {jsfsa.State} state
     * @return {jsfsa.Automaton} the instance of {@link jsfsa.Automaton} that is acted upon
     */
    Automaton.prototype.addState = function (state) {
        if (!this.hasState(state.name)) {
            var node = new Node(state);
            var parentNode = (state.parent) ? this._nodes[state.parent] : this._rootNode;
            parentNode.addChild(node);
            if (state.isInitial && parentNode.state === this.getCurrentState()) {
                this._currentBranch.push(node);
            }
            this._nodes[state.name] = node;
        }

        return this;
    };

    /**
     * Checks whether the a state with name <code>stateName</code> was added to the Automaton
     * @param {String} stateName
     * @return {Boolean}
     */
    Automaton.prototype.hasState = function (stateName) {
        return this._nodes.hasOwnProperty(stateName);
    };

    /**
     * Retrieves a state
     * @param {String} stateName
     * @return {jsfsa.State} <code>undefined</code> if no state with name <code>stateName</code> was found.
     */
    Automaton.prototype.getState = function (stateName) {
        if (this.hasState(stateName)) {
            return this._nodes[stateName].state;
        }

        return undefined;
    };

    /**
     * Removes the state with name <code>stateName</code> from the Automaton
     * @param {String} stateName
     * @return {jsfsa.Automaton} the instance of {@link jsfsa.Automaton} that is acted upon
     */
    Automaton.prototype.removeState = function (stateName) {
        if (this.hasState(stateName)) {
            var node = this._nodes[stateName];
            var parentNode = node.parent;
            parentNode.removeChild(node);
            var index = this._currentBranch.indexOf(node);
            if (index >= 0) {
                this._currentBranch.splice(index, this._currentBranch.length - index);
            }
            node.destroy();
            delete this._nodes[stateName];
        }

        return this;
    };

    /**
     * Starts transitioning from the current state to the state as defined by the transition
     * Accepts any number of arguments after <code>transitionName</code> that will be passed on to the
     * guards and actions
     * @param {String} transitionName
     * @return {jsfsa.Automaton} the instance of {@link jsfsa.Automaton} that is acted upon
     */
    Automaton.prototype.doTransition = function (transitionName) {
        if (this._internalState === 'ready') {
            var payload;
            if (arguments.length > 1) {
                payload = Array.prototype.slice.call(arguments);
                payload.shift(); //drop transitionname
            } else {
                payload = [];
            }

            this._newBranch = this._currentBranch;
            var eventFactory = new StateEventFactory(payload, transitionName, this.getCurrentState().name);
            var sourceNode = this._hasTransitionInCurrentBranch(transitionName);

            if (sourceNode === undefined) {
                //there's no transition with that name in the current state branch
                this._finishTransition(eventFactory.createArgsArray(StateEvent.TRANSITION_DENIED));
            } else {
                //transition found somewhere in the _currentStateBranch
                this._attemptTransition(sourceNode, eventFactory);
            }
        }
        return this;
    };

    /**
     * Parses a JSON formatted data object and translates it to states and transitions
     * @param {Object} data JSON formatted data object
     * @return {jsfsa.Automaton} the instance of {@link jsfsa.Automaton} that is acted upon
     */
    Automaton.prototype.parse = function (data) {
        for (var stateName in data) {
            if (data.hasOwnProperty(stateName)) {
                this.createState(stateName, data[stateName]);
            }
        }

        return this;
    };

    /**
     * Resumes the transitioning between states
     * @return {jsfsa.Automaton} the instance of {@link jsfsa.Automaton} that is acted upon
     */
    Automaton.prototype.proceed = function () {
        if (this._internalState === 'transitioning' || this._internalState === 'paused') {
            if (this._queue.length > 0) {
                this._internalState = 'transitioning';
                var o = this._queue.shift();
                var item = o.obj.state;
                item[o.method].call(item, o.args);
                if (this._internalState !== "paused") {
                    this.proceed();
                }
            }
        }

        return this;
    };

    /**
     * Pauses the transitioning between states
     * @return {jsfsa.Automaton} the instance of {@link jsfsa.Automaton} that is acted upon
     */
    Automaton.prototype.pause = function () {
        if (this._internalState === 'transitioning') {
            this._internalState = 'paused';
        }

        return this;
    };

    /**
     * Destroys all internal states and prepares the Automaton to be dismantled by
     * -- the horrible GARBAGE COLLECTOR --
     *
     * Sorry, couldn't resist.
     */
    Automaton.prototype.destroy = function () {
        this._rootNode.destroy();
        this._rootNode = undefined;
        this._nodes = undefined;
        this._currentBranch = undefined;
    };

    Automaton.prototype._hasTransitionInCurrentBranch = function (transitionName) {
        var runner;
        var found = false;
        for (var i = this._currentBranch.length - 1, n = 0; i >= n; i--) {
            runner = this._currentBranch[i].state;
            if (runner.hasTransition(transitionName)) {
                found = true;
                break;
            }
        }
        return found ? runner : undefined;
    };

    Automaton.prototype._attemptTransition = function (sourceNode, eventFactory) {
        var targetSpec = sourceNode.getTransition( eventFactory.transition );
        var targetName;
        if (typeof targetSpec === 'function') {
            var args = eventFactory.createArgsArray();
            targetName = targetSpec.apply(this, args);
        } else {
            targetName = targetSpec;
        }
        var targetNode = null;
        if ( targetName ) {
            targetNode = this._nodes[ targetName ];
        }
        if ( !targetNode ) {
            //state doesn't exist
            this._finishTransition(eventFactory.createArgsArray(StateEvent.TRANSITION_DENIED));
        } else {
            eventFactory.to = targetNode.state.name;
            var initialNodes = targetNode.getInitialBranch();
            this._newBranch = this._getBranchFromRoot(targetNode)
                .concat(initialNodes);
            var streams = this._getShortestRoute(this._currentBranch, this._newBranch);
            this._doExitGuardPhase(streams, eventFactory);
        }
    };

    /**
     * @private
     * @param {Node} node
     * @return {Node[]}
     */
    Automaton.prototype._getBranchFromRoot = function (node) {
        var branch = [];
        while (node) {
            branch.unshift(node);
            node = node.parent;
        }
        return branch;
    };

    /**
     * @private
     * @param {Node[]} rootToBegin
     * @param {Node[]} rootToEnd
     * @return {Object}
     */
    Automaton.prototype._getShortestRoute = function (rootToBegin, rootToEnd) {
        var i, n = Math.min(rootToBegin.length, rootToEnd.length);
        for (i = 0; i < n; i++) {
            if (rootToBegin[i] !== rootToEnd[i]) {
                break;
            }
        }

        var up = rootToBegin.slice(i)
            .reverse();
        var down = rootToEnd.slice(i);

        return {
            up: up,
            down: down
        };
    };
    Automaton.prototype._doExitGuardPhase = function (streams, eventFactory) {
        this._internalState = 'guarding';
        var proceed = this._executeGuards(streams.up, eventFactory.createArgsArray(Action.EXIT));
        if (!proceed) {
            this._newBranch = undefined;
            this._finishTransition(eventFactory.createArgsArray(StateEvent.EXIT_DENIED));
        } else {
            proceed = this._doEntryGuardPhase(streams, eventFactory);
        }
        return proceed;
    };
    Automaton.prototype._doEntryGuardPhase = function (streams, eventFactory) {
        var proceed = this._executeGuards(streams.down, eventFactory.createArgsArray(Action.ENTRY));
        if (!proceed) {
            this._newBranch = undefined;
            this._finishTransition(eventFactory.createArgsArray(StateEvent.ENTRY_DENIED));
        } else {
            this._startTransition(streams, eventFactory);
        }
        return proceed;
    };
    Automaton.prototype._executeGuards = function (nodesList, args) {
        var result = true;
        for (var i = 0, n = nodesList.length; i < n; i++) {
            var state = nodesList[i].state;
            result = state._executeGuards(args) && result;
        }

        return result;
    };

    Automaton.prototype._startTransition = function (streams, eventFactory) {
        this._internalState = 'transitioning';
        this._currentBranch = undefined;
        var referer = [
        {
            state: this
        }
        ];
        var args = eventFactory.createArgsArray(StateEvent.EXITED);
        this._queue = [];
        this._addToQueue(streams.up, '_dispatchArgs', args);
        this._addToQueue(referer, '_dispatchArgs', args);
        args = eventFactory.createArgsArray(StateEvent.ENTERED);
        this._addToQueue(streams.down, '_dispatchArgs', args);
        this._addToQueue(referer, '_dispatchArgs', args);
        this._addToQueue(referer, '_finishTransition', eventFactory.createArgsArray(StateEvent.CHANGED));
        this.proceed();
    };

    Automaton.prototype._addToQueue = function (list, method, args) {
        for (var i = 0, n = list.length; i < n; i++) {
            this._queue.push({
                obj: list[i],
                args: args,
                method: method
            });
        }
    };

    Automaton.prototype._finishTransition = function (args) {
        if (this._newBranch) {
            this._currentBranch = this._newBranch;
        } else {
            this._newBranch = undefined;
        }
        this._internalState = 'ready';
        this._dispatchArgs(args);
    };

    /**
     *
     * @type {Function}
     * @private
     */
    Automaton.prototype._dispatchArgs = State.prototype._dispatchArgs;

    /**
     * framework version number
     * @constant
     * @type String
     */
    pkg.VERSION= '@@version';

    pkg.Action = Action;
    pkg.StateEvent = StateEvent;
    pkg.State = State;
    pkg.Automaton = Automaton;

})(jsfsa || (jsfsa = {}));