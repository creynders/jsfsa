/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, curly:true, browser:true, maxerr:50, laxbreak:true, laxcomma:true */

/**
 * @author Camille Reynders
 * @version 0.1
 * Date: 27/02/12
 * Time: 15:05
 */


( function( $ ){
    "use strict";

    if ( $.hasOwnProperty( 'fsa' ) ) {
        return;
    }

    /**
     * @namespace
     * @name fsa
     */
    var fsa = {};

    fsa._Dispatcher = function(){
        this._listeners = {};
    };

    fsa._Dispatcher.prototype = {
        addListener : function( eventName, handler ){
            if( ! this._listeners.hasOwnProperty( eventName ) ){
                this._listeners[ eventName ] = [];
            }
            this._listeners[ eventName ].push( handler );

            return this;
        },

        addListeners : function( eventName, handlers ){
            if( ! this._listeners.hasOwnProperty( eventName ) ){
                this._listeners[ eventName ] = [];
            }
            this._listeners[ eventName ].concat( handlers );

            return this;
        },
        hasListener : function( eventName, handler ){
            return ( this._listeners.hasOwnProperty( eventName ) && this._listeners[ eventName ].indexOf( handler >= 0 ) );
        },
        removeListener : function( eventName, handler ){
            if( this._listeners.hasOwnProperty( eventName ) ){
                var index = this._listeners[ eventName ].indexOf( handler );
                if( index >= 0 ){
                    this._listeners[ eventName ].splice( index, 1 );
                }
            }
            return this;
        },

        dispatch : function( e ){
            var eventName = e.type;
            if( this._listeners.hasOwnProperty( eventName ) ){
                var args = Array.prototype.slice.call( arguments );
                for( var i=0, n=this._listeners[ eventName ].length ; i<n ; i++ ){
                    var handler = this._listeners[ eventName ][ i ];
                    handler.apply( this, args );
                }
            }
        },

        dispatchUntilFalseOrFinished : function( e ){
            var eventName = e.type;
            if( this._listeners.hasOwnProperty( eventName ) ){
                var args = Array.prototype.slice.call( arguments );
                for( var i=0, n=this._listeners[ eventName ].length ; i<n ; i++ ){
                    var handler = this._listeners[ eventName ][ i ];
                    if( ! handler.apply( this, args ) ) {
                        return false;
                    }
                }
            }

            return true;
        }
    };

    /**
     * @class
     * @constructor
     * @param {String} name
     * @param {Object} [data]
     */
    fsa.State = function( name, data ){
        /**
        * @type String
        * @default "State"
        * @const
        */
        this.FQN = 'State';

        /**
        * @type String
        */
        this.name = '';

        /**
        * name of the parent state
        * @type String
        */
        this.parent = '';

        /**
        * @type Boolean
        */
        this.isInitial = false;

        /**
         * @type Boolean
         */
        this._isTransitioning = false;

        /**
        * @private
        * @type Object
        */
        this._actions = undefined;

        /**
        * @private
        * @type Object
        */
        this._guards = undefined;

        /**
        * @private
        * @type {Object}
        */
        this._transitions = {};

        this._parseName( name );
        if( data ){
            if( data.isInitial ) {
                this.isInitial = true;
            }
            if( data.guards ){
                if( data.guards.enter ){
                    this._guards = this._addCallbacksList( this._guards, 'enter', data.guards.enter );
                }
                if( data.guards.exit ){
                    this._guards = this._addCallbacksList( this._guards, 'exit', data.guards.exit );
                }
            }
            if( data.actions ){
                if( data.actions.enter ){
                    this._actions = this._addCallbacksList( this._actions, 'enter', data.actions.enter );
                }
                if( data.actions.exit ){
                    this._actions = this._addCallbacksList( this._actions, 'exit', data.actions.exit );
                }
            }
            if( data.parent ){
                this.parent = data.parent;
            }
            if( data.transitions ){
                this._addTransitions( data.transitions );
            }

            this._addTransitions( data, fsa.State._configMembers );
        }
    };

    /**
     * @private
     * @static
     * @type {String[]}
     */
    fsa.State._events = [ 'enter', 'exit' ];

    /**
     * @private
     * @static
     * @type {String[]}
     */
    fsa.State._configMembers = [ 'isInitial', 'guards', 'actions', 'parent', 'transitions' ];

    fsa.State.prototype = {

        isTransitioning : function(){
            return this._isTransitioning;
        },

        halt : function(){
            this._isTransitioning = true;
        },

        /**
         *
         * @param {String} transitionName
         * @param {String} StateName
         * @throws {Error} 1040
         * @throws {Error} 1041
         * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
         */
        addTransition : function( transitionName, stateName ){
            if( ! transitionName || typeof transitionName !== "string" ){
                throw new Error( 1040 );
            }
            if( ! stateName || typeof stateName !== "string" ){
                throw new Error( 1041 );
            }
            this._transitions[ transitionName ] = stateName;
            return this;
        },

        /**
         *
         * @param {String} transitionName
         * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
         */
        removeTransition : function( transitionName ){
            delete this._transitions[ transitionName ];
            return this;
        },

        /**
         *
         * @param {String} transitionName
         * @return {String} target state name
         */
        getTransition : function( transitionName ){
            return this._transitions[ transitionName ];
        },

        /**
         *
         * @param {String} transitionName
         * @return {Boolean}
         */
        hasTransition : function( transitionName ){
            return this._transitions.hasOwnProperty( transitionName );
        },

        /**
         *
         * @param {String} eventName
         * @param {Function} callback
         * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
         */
        addAction : function( eventName, callback ){
            this._actions = this._addCallback( this._actions, eventName, callback );
            return this;
        },

        addActionsList : function( eventName, callbacks ){
            this._actions = this._addCallbacksList( this._actions, eventName, callbacks );
            return this;
        },

        /**
         *
         * @param {String} eventName
         * @param {Function} callback
         * @return {Boolean}
         */
        hasAction : function( eventName, callback ){
            return this._hasCallback( this._actions, eventName, callback );
        },

        /**
         *
         * @param {String} eventName
         * @param {Function} callback
         * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
         */
        removeAction : function( eventName, callback ){
            this._removeCallback( this._actions, eventName, callback);
            return this;
        },

        /**
         *
         * @param {String} eventName
         * @param {Function} callback
         * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
         */
        addGuard : function( eventName, callback ){
            this._guards = this._addCallback( this._guards, eventName, callback );
            return this;
        },

        addGuardsList : function( eventName, callbacks ){
            this._guards = this._addCallbacksList( this._guards, eventName, callbacks );
            return this;
        },

        /**
         *
         * @param {String} eventName
         * @param {Function} callback
         * @return {Boolean}
         */
        hasGuard : function( eventName, callback ){
            return this._hasCallback( this._guards, eventName, callback );
        },

        /**
         *
         * @param {String} eventName
         * @param {Function} callback
         * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
         */
        removeGuard : function( eventName, callback ){
            this._removeCallback( this._guards, eventName, callback );
            return this;
        },

        /**
         *
         * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
         */
        destroy : function(){
            this._actions = undefined;
            this._guards = undefined;
            this._parent = undefined;
            this._transitions = undefined;
            this.name = undefined;

            return this;
        },

        _parseName : function( name ){
            var index = name.lastIndexOf( '/' );
            if( index >=0 ){
                this.parent = name.substring( 0, index );
            }
            this.name = name;
        },

        /**
         * @internal
         */
        _executeActions : function(){
            if( this._actions ){
                var args = Array.prototype.slice.call( arguments );
                fsa._Dispatcher.prototype.dispatch.apply( this._actions, args );
            }
        },

        /**
         * @internal
         */
        _executeGuards : function(){
            if( this._guards ){
                var args = Array.prototype.slice.call( arguments );
                return fsa._Dispatcher.prototype.dispatchUntilFalseOrFinished.apply( this._guards, args );
            }

            return true;
        },

        /**
         *
         * @param {String} eventName
         * @param {Function} callback
         * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
         */
        _addCallback : function( dispatcher, eventName, callback ){
            if( dispatcher === undefined ){
                dispatcher = new fsa._Dispatcher();
            }
            dispatcher.addListener( eventName, callback );
            return dispatcher;
        },

        _addCallbacksList : function( dispatcher, eventName, callbacks ){
            if( dispatcher === undefined ){
                dispatcher = new fsa._Dispatcher();
            }
            if( typeof callbacks === "function" ){
                callbacks = [ callbacks ];
            }
            dispatcher.addListeners( eventName, callbacks );
            return dispatcher;
        },

        /**
         *
         * @param {String} eventName
         * @param {Function} callback
         * @return {Boolean}
         */
        _hasCallback : function( dispatcher, eventName, callback ){
            return dispatcher && dispatcher.hasListener( eventName, callback );
        },

        /**
         *
         * @param {String} eventName
         * @param {Function} callback
         * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
         */
        _removeCallback : function( dispatcher, eventName, callback ){
            if( dispatcher ){
                dispatcher.removeListener( eventName, callback );
            }
            return dispatcher;
        },

        /**
         * @private
         * @param {Object} data
         * @param {String[]} [skip]
         */
        _addTransitions : function( data, skip ){
            for( var transitionName in data ){
                if( data.hasOwnProperty( transitionName ) ){
                    if( skip && skip.indexOf( transitionName ) >= 0 ) {
                        continue;
                    }
                    this.addTransition( transitionName, data[ transitionName ] );
                }
            }
        }

    };

    fsa._Node = function( state ){
        this.state = state;
        this.parent = undefined;
        this.children = undefined;
        this.initialChild = undefined;
    };

    fsa._Node.prototype = {
        addChild : function( node ){
            if( ! this.children ) {
                this.children = {};
            }
            node.parent = this;
            if( node.state.isInitial ) {
                this.initialChild = node;
            }
            this.children[ node.state.name ] = node;
        },
        removeChild : function( node ){
            if( this.initialChild === node ) {
                this.initialChild = undefined;
            }
            delete this.children[ node.state.name ];
        },
        destroy : function(){
            for( var stateName in this.children ){
                if( this.children.hasOwnProperty( stateName ) ){
                    this.children[ stateName ].destroy();
                }
            }
            this.state = undefined;
            this.parent = undefined;
            this.children = undefined;
        },
        getInitialBranch : function(){
            var result = [];
            var initial = this.initialChild;
            while( initial ){
                result.push( initial );
                initial = initial.initialChild;
            }

            return result;
        }
    };

    /**
     * @class
     * @constructor
     */
    fsa.Automaton = function( data ){
        this._nodes = {};
        this._rootNode = new fsa._Node( new fsa.State( '*' ), true );
        this._currentBranch = [ this._rootNode ];
        this._transitioning = 'ready';
        this._actionsQueue = [];
        this._newBranch = undefined;
        if( data ){
            this.parse( data );
        }
    };

    fsa.Automaton.prototype = {
        /**
         * @const
         * @type String
         * @default 'Automaton'
         */
        FQN : 'Automaton',

        isTransitioning : function(){
            return this._transitioning !== 'ready';
        },

        /**
         * @return {fsa.State}
         */
        getRootState : function(){
            return this._rootNode.state;
        },

        /**
         * @return {fsa.State}
         */
        getCurrentState : function(){
            return this._currentBranch[ this._currentBranch.length -1 ].state;
        },

        /**
         *
         * @param {String} stateName
         * @param {Object} stateData
         * @return {fsa.Automaton} the instance of {@link fsa.Automaton} that is acted upon
         */
        createState : function( stateName, stateData ){
            var state = new fsa.State( stateName, stateData );
            this.addState( state );

            return this;
        },

        /**
         *
         * @param {fsa.State} state
         * @return {fsa.Automaton} the instance of {@link fsa.Automaton} that is acted upon
         */
        addState : function( state ){
            if( ! this.hasState( state.name ) ){
                var node = new fsa._Node( state );
                var parentNode = ( state.parent )
                    ? this._nodes[ state.parent ]
                    : this._rootNode
                ;
                parentNode.addChild( node );
                if( state.isInitial && parentNode.state === this.getCurrentState() ){
                    this._currentBranch.push( node );
                }
                this._nodes[ state.name ] = node;
            }

            return this;
        },

        /**
         *
         * @param {String} stateName
         * @return {Boolean}
         */
        hasState : function( stateName ){
            return this._nodes.hasOwnProperty( stateName );
        },

        /**
         *
         * @param {String} stateName
         * @return {fsa.State} <code>undefined</code> if no state with name <code>stateName</code> was found.
         */
        getState : function( stateName ){
            if( this.hasState( stateName ) ){
                return this._nodes[ stateName ].state;
            }

            return undefined;
        },

        /**
         *
         * @param {String} stateName
         * @return {fsa.Automaton} the instance of {@link fsa.Automaton} that is acted upon
         */
        removeState : function( stateName ){
            if( this.hasState( stateName ) ){
                var node = this._nodes[ stateName ];
                var parentNode = node.parent;
                parentNode.removeChild( node );
                var index = this._currentBranch.indexOf( node );
                if( index >= 0 ){
                    this._currentBranch.splice( index, this._currentBranch.length - index );
                }
                node.destroy();
                delete this._nodes[ stateName ];
            }

            return this;
        },

        /**
         * Accepts any number of arguments after <code>transitionName</code> that will be passed on to the
         * guards and actions
         * @param {String} transitionName
         * @return {fsa.Automaton} the instance of {@link fsa.Automaton} that is acted upon
         */
        doTransition : function( transitionName ){
            var runner;
            for( var i=this._currentBranch.length -1, n = 0  ; i>=n ; i-- ){
                runner = this._currentBranch[ i ].state;
                if( runner.hasTransition( transitionName ) ){
                    break;
                }
            }
            if( i>=0 ){
                //transition found somewhere in the _currentStateBranch
                var node = this._nodes[ runner.getTransition( transitionName ) ];
                if( node ){
                    //TODO: determine what to do if node not found?? Currently failing silenlty

                    var initialNodes = node.getInitialBranch();
                    this._newBranch = this._getFullBranch( node ).concat( initialNodes );
                    var streams = this._getShortestRoute( this._currentBranch, this._newBranch );
                    var currentStateName = this.getCurrentState().name;
                    var newStateName = node.state.name;
                    var payload = Array.prototype.slice.call( arguments );
                    payload.shift(); //drop transitionName
                    var exitArgs = [ { type : 'exit', from : currentStateName, to : newStateName } ].concat( payload );
                    var enterArgs = [ { type : 'enter', from : currentStateName, to : newStateName } ].concat( payload );
                    this._transitioning = 'guarding';
                    var proceed = this._applyToEachNode( streams.up,     fsa.State.prototype._executeGuards,    exitArgs, true );
                    if( proceed ){
                        proceed = this._applyToEachNode( streams.down,   fsa.State.prototype._executeGuards,   enterArgs, true );
                    }
                    if( proceed ) {
                        this._transitioning = 'running';
                        this._addToActionsQueue( streams.up, exitArgs );
                        this._addToActionsQueue( streams.down, enterArgs );
                        this.proceed();
                    }else{
                        this._transitioning = 'ready';
                    }
                }
            }
        },

        /**
         *
         * @param {Object} data JSON formatted data object
         */
        parse : function( data ){
            for( var stateName in data ){
                if( data.hasOwnProperty( stateName ) ){
                    this.createState( stateName, data[ stateName ] );
                }
            }
        },

        /**
         *
         */
        proceed : function(){
            if( this._transitioning !== 'ready' && this._transitioning !== 'guarding' ){
                if( this._actionsQueue.length > 0 ){
                    this._transitioning = 'running';
                    var o = this._actionsQueue.shift();
                    var state = o.node.state;
                    fsa.State.prototype._executeActions.apply( state, o.args );
                    if( this._transitioning !== "paused" ){
                        this.proceed();
                    }
                }else{
                    this._finishTransition();
                }
            }
        },

        /**
         *
         */
        pause : function(){
            if( this._transitioning === 'running' ){
                this._transitioning = 'paused';
            }
        },

        /**
         *
         */
        destroy : function(){
            this._rootNode.destroy();
            this._rootNode = undefined;
            this._nodes = undefined;
            this._currentStateBranch = undefined;
        },

        _addToActionsQueue: function( nodesList, args ){
            for( var i=0, n=nodesList.length ; i<n ; i++ ){
                this._actionsQueue.push( { node : nodesList[ i ], args : args } );
            }
        },

        _finishTransition : function(){
            this._transitioning = 'ready';
            this._currentBranch = this._newBranch;
            this._newBranch = undefined;
        },

        /**
         * @private
         * @param {fsa._Node} node
         * @return {fsa._Node[]}
         */
        _getFullBranch : function( node ){
            var branch = [];
            do{
                branch.unshift( node );
                node = node.parent;
            }while( node );

            return branch;
        },


        /**
         * @private
         * @param {fsa._Node[]} rootToBegin
         * @param {fsa._node[]} rootToEnd
         * @return {Object}
         */
        _getShortestRoute : function( rootToBegin, rootToEnd ){
            var i, n = Math.min( rootToBegin.length, rootToEnd.length );
            for( i=0 ; i<n ; i++ ){
                if( rootToBegin[ i ] !== rootToEnd[ i ] ){
                    break;
                }
            }

            var up = rootToBegin.slice( i ).reverse();
            var down = rootToEnd.slice( i );

            return {
                up : up,
                down : down
            };
        },

        /**
         * @private
         * @param {fsa._Node[]} nodesList
         * @param {Function} callback
         * @param {Array} args
         * @param {Boolean} [allowInterrupt=false]
         */
        _applyToEachNode : function( nodesList, callback, args, allowInterrupt ){
            if( allowInterrupt === undefined ){
                allowInterrupt = false;
            }
            var proceed = true;
            for( var i=0, n=nodesList.length; ( ! allowInterrupt || proceed ) && i<n ; i++){
                var state = nodesList[ i ].state;
                proceed = callback.apply( state, args );
            }

            return proceed;
        }


    };

    $.fsa = fsa;

} ( this ) );



