/**
 * @author Camille Reynders
 * @version 0.1
 * Date: 27/02/12
 * Time: 15:05
 */


( function( $ ){

    if ( 'fsa' in $ ) return;

    /**
     * @namespace
     * @name fsa
     */
    var fsa = {};

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
        * @private
        * @type Object
        */
        this._actions = {};

        /**
        * @private
        * @type Object
        */
        this._guards = {};

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
                if( data.guards.enter ) this._addCallbacks( this._guards, 'enter', data.guards.enter );
                if( data.guards.exit ) this._addCallbacks( this._guards, 'exit', data.guards.exit );
            }
            if( data.actions ){
                if( data.actions.enter ) this._addCallbacks( this._actions, 'enter', data.actions.enter );
                if( data.actions.exit ) this._addCallbacks( this._actions, 'exit', data.actions.exit );
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
    fsa.State._configMembers = [ 'name', 'isInitial', 'guards', 'actions', 'parent', 'transitions' ];

    fsa.State.prototype = {


        /**
         *
         * @param {String} transitionName
         * @param {String} StateName
         * @throws {Error} 1040
         * @throws {Error} 1041
         * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
         */
        addTransition : function( transitionName, stateName ){
            if( ! transitionName || typeof transitionName != "string" ) throw new Error( 1040 );
            if( ! stateName || typeof stateName != "string" ) throw new Error( 1041 );
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
            return this
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
            if( fsa.State._events.indexOf( eventName ) < 0 ) throw new Error( 1060 );
            if( ! callback || typeof callback != "function" ) throw new Error( 1061 );
            this._addCallback( this._actions, eventName, callback );
            return this;
        },

        /**
         *
         * @param {String} eventName
         * @param {Function} callback
         * @return {Boolean}
         */
        hasAction : function( eventName, callback ){
            return this._getCallbackIndex( this._actions, eventName, callback ) >= 0;
        },

        /**
         *
         * @param {String} eventName
         * @param {Function} callback
         * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
         */
        removeAction : function( eventName, callback ){
            this._removeCallback( this._actions, eventName, callback );
            return this;
        },

        /**
         *
         * @param {String} eventName
         * @param {Function} callback
         * @return {fsa.State} the instance of {@link fsa.State} that is acted upon
         */
        addGuard : function( eventName, callback ){
            if( fsa.State._events.indexOf( eventName ) < 0 ) throw new Error( 1070 );
            if( ! callback || typeof callback != "function" ) throw new Error( 1071 );
            this._addCallback( this._guards, eventName, callback );
            return this;
        },

        /**
         *
         * @param {String} eventName
         * @param {Function} callback
         * @return {Boolean}
         */
        hasGuard : function( eventName, callback ){
            return this._getCallbackIndex( this._guards, eventName, callback ) >= 0;
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
         * @param {String} eventName
         * @param {fsa.State} fromState
         * @param {fsa.State} toState
         */
        _executeActions : function( eventName, fromState, toState ){
            if( this._actions.hasOwnProperty( eventName ) ){
                var payload = {
                    event : eventName,
                    from : fromState.name,
                    to : toState.name
                }
                for( var i=0, n=this._actions[ eventName ].length ; i<n ; i++ ){
                    var callback = this._actions[ eventName ][ i ];
                    callback.call( this, payload );
                }
            }
        },

        /**
         * @internal
         * @param {String} eventName
         * @param {fsa.State} fromState
         * @param {fsa.State} toState
         * @return {Boolean}
         */
        _executeGuards : function( eventName, fromState, toState ){
            if( this._guards.hasOwnProperty( eventName ) ){
                var payload = {
                    event : eventName,
                    from : fromState.name,
                    to : toState.name
                };
                for( var i=0, n=this._guards[ eventName ].length ; i<n ; i++ ){
                    var callback = this._guards[ eventName ][ i ];
                    if( ! callback.call( this, payload ) ) return false;
                }
            }

            return true;
        },

        /**
         * @private
         * @param {Array} callbacksList
         * @param {String} eventName
         * @param {Function} callback
         */
        _getCallbackIndex : function( callbacksList, eventName, callback ){
            if( callbacksList && callbacksList.hasOwnProperty( eventName ) ){
                return callbacksList[ eventName ].indexOf( callback );
            }

            return -1;
        },


        /**
         * @private
         * @param {Function[]} receiver
         * @param {String} eventName
         * @param {Function[]|Function} callbacks
         */
        _addCallbacks: function( receiver, eventName, callbacks ){
            if( typeof callbacks == "function" ){
                this._addCallback( receiver, eventName, callbacks );
            }else{
                for( var i=0, n=callbacks.length ; i<n ; i++ ){
                    this._addCallback( receiver, eventName, callbacks[ i ] );
                }
            }
        },


        /**
         * @private
         * @param {Function[]} receiver
         * @param {String} eventName
         * @param {Function} callback
         */
        _addCallback : function( receiver, eventName, callback ){
            if( ! receiver.hasOwnProperty( eventName ) ) receiver[ eventName ] = [];
            if( receiver[ eventName ].indexOf( callback ) < 0 ) receiver[ eventName ].push( callback );
        },

        /**
         * @private
         * @param {Function[]} callbacksList
         * @param {String} eventName
         * @param {Function} callback
         */
        _removeCallback : function( callbacksList, eventName, callback ){
            var index = this._getCallbackIndex( callbacksList, eventName, callback );
            if( index >= 0 ) callbacksList[ eventName ].splice( index, 1 );
        },

        /**
         * @private
         * @param {Object} data
         * @param {String[]} [skip]
         */
        _addTransitions : function( data, skip ){
            for( var transitionName in data ){
                if( skip && skip.indexOf( transitionName ) >= 0 ) continue;
                this.addTransition( transitionName, data[ transitionName ] );
            }
        }

    };

    /**
     * @ignore
     * @internal
     * @class
     * @constructor
     * @param {fsa.State} state
     */
    fsa._Node = function( state ){
        this.state = state;
        this.parent = undefined;
        this.children = undefined;
        this.initialChild = undefined;
    };

    fsa._Node.prototype = {
        /**
         *
         * @param {fsa._Node} node
         */
        addChild : function( node ){
            if( ! this.children ) this.children = {};
            node.parent = this;
            if( node.state.isInitial ) this.initialChild = node;
            this.children[ node.state.name ] = node;
        },
        /**
         *
         * @param {fsa._Node} node
         */
        removeChild : function( node ){
            if( this.initialChild === node ) this.initialChild = undefined;
            delete this.children[ node.state.name ];
        },
        destroy : function(){
            for( var stateName in this.children ){
                this.children[ stateName ].destroy();
            }
            this.state = undefined;
            this.parent = undefined;
            this.children = undefined;
        },
        /**
         * @return {fsa._Node[]}
         */
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
                var parentNode = ( state.parent ) ? this._nodes[ state.parent ] : this._rootNode;
                parentNode.addChild( node );
                if( state.isInitial && parentNode.state == this.getCurrentState() ) this._currentBranch.push( node );
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
            if( this.hasState( stateName ) ) return this._nodes[ stateName ].state;

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
                if( index >= 0 ) this._currentBranch.splice( index, this._currentBranch.length - index );
                node.destroy();
                delete this._nodes[ stateName ];
            }

            return this;
        },

        /**
         *
         * @param {String} transitionName
         * @return {fsa.Automaton} the instance of {@link fsa.Automaton} that is acted upon
         */
        doTransition : function( transitionName ){
            var runner;
            for( var i=this._currentBranch.length -1, n = 0  ; i>=n ; i-- ){
                runner = this._currentBranch[ i ].state
                if( runner.hasTransition( transitionName ) ) break;
            }
            if( i>=0 ){
                //transition found somewhere in the _currentStateBranch
                var node = this._nodes[ runner.getTransition( transitionName ) ];
                if( node ){
                    //TODO: determine what to do if node not found?? Currently failing silenlty

                    var newStateBranch = this._getFullBranch( node );
                    var streams = this._getShortestRoute( this._currentBranch, newStateBranch );

                    var args = [ this.getCurrentState(), node.state ];
                    var proceed = this._applyToEachNode( streams.up,     fsa.State.prototype._executeGuards,    [ 'exit' ].concat( args ), true );
                    var initialNodes;
                    if( proceed ){
                        initialNodes = node.getInitialBranch();
                        proceed = this._applyToEachNode( streams.down.concat( initialNodes ),   fsa.State.prototype._executeGuards,   [ 'enter' ].concat( args ), true );
                    }
                    if( proceed ) {
                        this._applyToEachNode( streams.up,     fsa.State.prototype._executeActions,     [ 'exit' ].concat( args ), false );
                        this._applyToEachNode( streams.down,   fsa.State.prototype._executeActions,    [ 'enter' ].concat( args ), false );
                        this._currentBranch = newStateBranch.concat( initialNodes );
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
                this.createState( stateName, data[ stateName ] );
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
                if( rootToBegin[ i ] != rootToEnd[ i ] ) break;
            }

            var up = rootToBegin.slice( i ).reverse();
            var down = rootToEnd.slice( i );

            return {
                up : up,
                down : down
            }
        },

        /**
         * @private
         * @param {fsa._Node[]} nodesList
         * @param {Function} callback
         * @param {Array} args
         * @param {Boolean} [allowInterrupt=false]
         */
        _applyToEachNode : function( nodesList, callback, args, allowInterrupt ){
            if( allowInterrupt == undefined ) allowInterrupt = false;
            var proceed = true;
            for( var i=0, n=nodesList.length; ( ! allowInterrupt || proceed ) && i<n ; i++){
                var state = nodesList[ i ].state;
                proceed = callback.apply( state, args );
            }

            return proceed
        }


    }

    $.fsa = fsa;

} ( this ) );



