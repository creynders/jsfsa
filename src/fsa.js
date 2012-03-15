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

    var cloneAndUnshift = function( arr, item ){
        var result = arr.slice( 0 );
        result.unshift( item );
        return result;
    }

    /**
     * @namespace
     * @name fsa
     */
    var fsa = {};

 //--( Dispatcher )--//

    var Dispatcher = function( target ){
        this._listeners = {};
    };

    Dispatcher.prototype.addListener = function( eventName, handler ){
        if( ! this._listeners.hasOwnProperty( eventName ) ){
            this._listeners[ eventName ] = [];
        }
        this._listeners[ eventName ].push( handler );

        return this;
    };

    Dispatcher.prototype.addListeners = function( eventName, handlers ){
        if( typeof handlers === "function" ){
            return this.addListener( eventName, handlers );
        }

        var arr;
        if( ! this._listeners.hasOwnProperty( eventName ) ){
            arr = [];
        }else{
            arr = this._listeners[ eventName ]
        }

        this._listeners[ eventName ] = arr.concat( handlers );

        return this;
    };

    Dispatcher.prototype.hasListener = function( eventName, handler ){
        if( this._listeners.hasOwnProperty( eventName ) ){
            var index = this._listeners[ eventName ].indexOf( handler );
            return index >= 0;
        }
        return false;
    };

    Dispatcher.prototype.removeListener = function( eventName, handler ){
        if( this._listeners.hasOwnProperty( eventName ) ){
            var index = this._listeners[ eventName ].indexOf( handler );
            if( index >= 0 ){
                this._listeners[ eventName ].splice( index, 1 );
            }
        }
        return this;
    };

    Dispatcher.prototype.dispatch = function( e ){
        var eventName = e.type;
        var result = true;
        if( this._listeners.hasOwnProperty( eventName ) ){
            var args = Array.prototype.slice.call( arguments );
            for( var i=0, n=this._listeners[ eventName ].length ; i<n ; i++ ){
                var handler = this._listeners[ eventName ][ i ];
                result = handler.apply( this, args ) && result;
            }
        }
        return result;
    };

//--( DispatcherProxy )--//

    var DispatcherProxy = function(){
    };
    DispatcherProxy.prototype = Dispatcher.prototype;

//--( StateEvent )--//

    fsa.StateEvent = function( type, from, to ){
        this.type = type;
        this.from = from;
        this.to = to;
    };
    fsa.StateEvent.prototype = {
        clone : function(){
            return new fsa.StateEvent( this.type, this.from, this.to );
        }
    }

//--( State )--//

    /**
     * @class
     * @constructor
     * @param {String} name
     * @param {Object} [data]
     */
    fsa.State = function( name, data ){
        Dispatcher.call( this );

        /**
        * @type String
        */
        this.name = '';

        /**
        * name of the parent state
        * @type String
        */
        this.parent = undefined;

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
        * @type fsa._Dispatcher
        */
        this._guardian = undefined;

        /**
        * @private
        * @type {Object}
        */
        this._transitions = {};

        this._parseData( name, data );
    };

    fsa.State.prototype = new DispatcherProxy();
    fsa.State.prototype.constructor = fsa.State;

    fsa.State._configMembers = [ 'isInitial', 'guards', 'listeners', 'parent', 'transitions' ];

    /**
     *
     * @param {String} transitionName
     * @param {String} StateName
     * @throws {Error} 1040
     * @throws {Error} 1041
     * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
     */
    fsa.State.prototype.addTransition = function( transitionName, stateName ){
        if( ! transitionName || typeof transitionName !== "string" ){
            throw new Error( 1040 );
        }
        if( ! stateName || typeof stateName !== "string" ){
            throw new Error( 1041 );
        }
        this._transitions[ transitionName ] = stateName;
        return this;
    };

    /**
     *
     * @param {String} transitionName
     * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
     */
    fsa.State.prototype.removeTransition = function( transitionName ){
        delete this._transitions[ transitionName ];
        return this;
    };

    /**
     *
     * @param {String} transitionName
     * @return {String} target state name
     */
    fsa.State.prototype.getTransition = function( transitionName ){
        return this._transitions[ transitionName ];
    };

    /**
     *
     * @param {String} transitionName
     * @return {Boolean}
     */
    fsa.State.prototype.hasTransition = function( transitionName ){
        return this._transitions.hasOwnProperty( transitionName );
    };

    /**
     *
     * @param {String} eventName
     * @param {Function} callback
     * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
     */
    fsa.State.prototype.addGuard = function( eventName, guard ){
        this._getGuardian().addListener( eventName, guard );
        return this;
    };

    fsa.State.prototype.addGuards = function( eventName, guards ){
        this._getGuardian().addListeners( eventName, guards );
        return this;
    };

    /**
     *
     * @param {String} eventName
     * @param {Function} callback
     * @return {Boolean}
     */
    fsa.State.prototype.hasGuard = function( eventName, guard ){
        return this._guardian && this._guardian.hasListener( eventName, guard );
    };

    /**
     *
     * @param {String} eventName
     * @param {Function} callback
     * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
     */
    fsa.State.prototype.removeGuard = function( eventName, guard ){
        if( this._guardian ){
            this._guardian.removeListener( eventName, guard );
        }
        return this;
    };

    /**
     *
     * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
     */
    fsa.State.prototype.destroy = function(){
        this._guardian = undefined;
        this._parent = undefined;
        this._transitions = undefined;
        this.name = undefined;

        return this;
    };

    fsa.State.prototype._getGuardian = function(){
        if( this._guardian === undefined ){
            this._guardian = new Dispatcher();
        }
        return this._guardian;
    };

    fsa.State.prototype._parseName = function( name ){
        var index = name.lastIndexOf( '/' );
        if( index >=0 ){
            this.parent = name.substring( 0, index );
        }
        this.name = name;
    };

    /**
     * @internal
     * @param {Array} args
     */
    fsa.State.prototype._executeGuards = function( args ){
        var result = true;
        if( this._guardian ){
            result = this._guardian.dispatch.apply( this._guardian, args );
        }

        return result;
    };

    /**
     * @private
     * @param {Object} data
     * @param {String[]} [skip]
     */
    fsa.State.prototype._addTransitions = function( data, skip ){
        for( var transitionName in data ){
            if( data.hasOwnProperty( transitionName ) ){
                if( skip && skip.indexOf( transitionName ) >= 0 ) {
                    continue;
                }
                this.addTransition( transitionName, data[ transitionName ] );
            }
        }
    };

    /**
     * @private
     * @param {Array} args
     */
    fsa.State.prototype._executeAction = function( args ){
        this.dispatch.apply( this, args );
    };

    fsa.State.prototype._parseData = function( name, data ){
        this._parseName( name );

        if( data ){
            if( data.isInitial ) {
                this.isInitial = true;
            }
            if( data.guards ){
                if( data.guards.enter ){
                    this.addGuards( 'enter', data.guards.enter );
                }
                if( data.guards.exit ){
                    this.addGuards('exit', data.guards.exit );
                }
            }
            for( var eventName in data.listeners ){
                this.addListeners( eventName, data.listeners[ eventName ] );
            }
            if( data.parent ){
                this.parent = data.parent;
            }
            if( data.transitions ){
                this._addTransitions( data.transitions );
            }

            this._addTransitions( data, fsa.State._configMembers );
        };
    };

//--( Node )--//

    var Node = function( state ){
        this.FQN = 'Node';
        this.state = state;
        this.parent = undefined;
        this.children = undefined;
        this.initialChild = undefined;
    };

    Node.prototype = {
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

//--( Node )--//
    /**
     * @class
     * @constructor
     */
    fsa.Automaton = function( data ){
        Dispatcher.call( this );
        this._nodes = {};
        this._rootNode = new Node( new fsa.State('root') );
        this._currentBranch = [ this._rootNode ];
        this._internalState = 'ready';
        this._queue = [];
        this._newBranch = undefined;
        if( data ){
            this.parse( data );
        }
    };

    fsa.Automaton.prototype = new DispatcherProxy();
    fsa.Automaton.prototype.constructor = fsa.Automaton;

    /**
     * @const
     * @type String
     * @default 'Automaton'
     */
    fsa.Automaton.prototype.FQN = 'Automaton';

    fsa.Automaton.prototype.isTransitioning = function(){
        return this._internalState === 'transitioning' || this._internalState === 'paused';
    }

    /**
     * @return {fsa.State}
     */
    fsa.Automaton.prototype.getRootState = function(){
        return this._rootNode.state;
    };

    /**
     * @return {fsa.State}
     */
    fsa.Automaton.prototype.getCurrentState = function(){
        return this._currentBranch[ this._currentBranch.length -1 ].state;
    };

    /**
     *
     * @param {String} stateName
     * @param {Object} stateData
     * @return {fsa.Automaton} the instance of {@link fsa.Automaton} that is acted upon
     */
    fsa.Automaton.prototype.createState = function( stateName, stateData ){
        var state = new fsa.State( stateName, stateData );
        this.addState( state );

        return this;
    };

    /**
     *
     * @param {fsa.State} state
     * @return {fsa.Automaton} the instance of {@link fsa.Automaton} that is acted upon
     */
    fsa.Automaton.prototype.addState = function( state ){
        if( ! this.hasState( state.name ) ){
            var node = new Node( state );
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
    };

    /**
     *
     * @param {String} stateName
     * @return {Boolean}
     */
    fsa.Automaton.prototype.hasState = function( stateName ){
        return this._nodes.hasOwnProperty( stateName );
    };

    /**
     *
     * @param {String} stateName
     * @return {fsa.State} <code>undefined</code> if no state with name <code>stateName</code> was found.
     */
    fsa.Automaton.prototype.getState = function( stateName ){
        if( this.hasState( stateName ) ){
            return this._nodes[ stateName ].state;
        }

        return undefined;
    };

    /**
     *
     * @param {String} stateName
     * @return {fsa.Automaton} the instance of {@link fsa.Automaton} that is acted upon
     */
    fsa.Automaton.prototype.removeState = function( stateName ){
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
    };

    /**
     * Accepts any number of arguments after <code>transitionName</code> that will be passed on to the
     * guards and actions
     * @param {String} transitionName
     * @return {fsa.Automaton} the instance of {@link fsa.Automaton} that is acted upon
     */
    fsa.Automaton.prototype.doTransition = function( transitionName ){
        var runner;
        var found = false;
        for( var i=this._currentBranch.length -1, n = 0  ; i>=n ; i-- ){
            runner = this._currentBranch[ i ].state;
            if( runner.hasTransition( transitionName ) ){
                found = true;
                break;
            }
        }
        if( found ){
            //transition found somewhere in the _currentStateBranch
            var targetNode = this._nodes[ runner.getTransition( transitionName ) ];
            if( targetNode ){
                //TODO: determine what to do if targetNode not found?? Currently failing silenlty

                var initialNodes = targetNode.getInitialBranch();
                this._newBranch = this._getBranchFromRoot( targetNode ).concat( initialNodes );
                var streams = this._getShortestRoute( this._currentBranch, this._newBranch );
                var currentStateName = this.getCurrentState().name;
                var newStateName = targetNode.state.name;

                var payload;
                if( arguments.length > 1 ){
                    payload =  Array.prototype.slice.call( arguments );
                    payload.shift(); //drop transitionname
                }else{
                    payload = [];
                }

                this._internalState = 'guarding';

                var args = cloneAndUnshift( payload, new fsa.StateEvent( 'exit', currentStateName, newStateName ) );
                var proceed = this._executeGuards( streams.up, args  );
                if( !proceed ){
                    args = cloneAndUnshift( payload, new fsa.StateEvent( 'exitDenied', currentStateName, newStateName ) );
                    this.dispatch.apply( this, args );
                }else{
                    args = cloneAndUnshift( payload, new fsa.StateEvent( 'enter', currentStateName, newStateName ) );
                    proceed = this._executeGuards( streams.down, args );
                }

                if( ! proceed ){
                    args = cloneAndUnshift( payload, new fsa.StateEvent( 'enterDenied', currentStateName, newStateName ) );
                    this.dispatch.apply( this, args );
                    this._internalState = 'ready';
                }else{
                    this._internalState = 'transitioning';
                    var referer = [ { state : this } ];
                    args = cloneAndUnshift( payload, new fsa.StateEvent( 'exit', currentStateName, newStateName ) );
                    this._addToQueue( streams.up, args );
                    this._addToQueue( referer, args );
                    args = cloneAndUnshift( payload, new fsa.StateEvent( 'enter', currentStateName, newStateName ) );
                    this._addToQueue( streams.down, args );
                    this._addToQueue( referer, args );
                    this.proceed();
                }
            }
        }
    };


    /**
     *
     * @param {Object} data JSON formatted data object
     */
    fsa.Automaton.prototype.parse = function( data ){
        for( var stateName in data ){
            if( data.hasOwnProperty( stateName ) ){
                this.createState( stateName, data[ stateName ] );
            }
        }
    };

    /**
     *
     */
    fsa.Automaton.prototype.proceed = function(){
        if( this._internalState !== 'ready' && this._internalState !== 'guarding' ){
            if( this._queue.length > 0 ){
                this._internalState = 'transitioning';
                var o = this._queue.shift();
                var state = o.obj.state;
                state._executeAction( o.args );
                if( this._internalState !== "paused" ){
                    this.proceed();
                }
            }else{
                this._finishTransition();
            }
        }
    };

    /**
     *
     */
    fsa.Automaton.prototype.pause = function(){
        if( this._internalState === 'transitioning' ){
            this._internalState = 'paused';
        }
    };

    /**
     *
     */
    fsa.Automaton.prototype.destroy = function(){
        this._rootNode.destroy();
        this._rootNode = undefined;
        this._nodes = undefined;
        this._currentStateBranch = undefined;
    };

    /**
     * @private
     * @param {Node} node
     * @return {Node[]}
     */
    fsa.Automaton.prototype._getBranchFromRoot = function( node ){
        console.log( '>>>>>>>>>>> _getBranchFromRoot');
        var branch = [];
        while( node ){
            branch.unshift( node );
            node = node.parent;
        };

        console.log( branch );

        return branch;
    };


    /**
     * @private
     * @param {Node[]} rootToBegin
     * @param {Node[]} rootToEnd
     * @return {Object}
     */
    fsa.Automaton.prototype._getShortestRoute = function( rootToBegin, rootToEnd ){
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
    };

    /**
     * @private
     * @param {Node[]} nodesList
     * @param {Function} callback
     * @param {Array} args
     * @param {Boolean} [allowInterrupt=false]
     */
    fsa.Automaton.prototype._executeGuards = function( nodesList, args ){
        var result = true;
        for( var i=0, n=nodesList.length; i<n ; i++){
            var state = nodesList[ i ].state;
            result = state._executeGuards( args ) && result;
        }

        return result;
    };

    fsa.Automaton.prototype._addToQueue = function( list, args ){
        for( var i=0, n=list.length ; i<n ; i++ ){
            this._queue.push( { obj : list[ i ], args : args } );
        }
    };

    fsa.Automaton.prototype._finishTransition = function(){
        this._internalState = 'ready';
        this._currentBranch = this._newBranch;
        this._newBranch = undefined;
    };

    fsa.Automaton.prototype._executeAction = fsa.State.prototype._executeAction;


    $.fsa = fsa;

} ( this ) );



