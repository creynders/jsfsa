/**
 * @author Camille Reynders
 * Date: 27/02/12
 * Time: 15:05
 */


( function( $ ){
    "use strict";

    if ( 'jsfsm' in $ ) return;

    /**
     * @namespace
     * @name jsfsm
     */
    var jsfsm = {};

    /**
     * @class
     * @constructor
     */
    jsfsm.StateData = function(){
    };

    jsfsm.StateData.prototype = {
        /**
         * @type String
         * @default "StateData"
         */
        fqn : 'StateData',

        /**
         * @type Boolean
         * @default false
         */
        initial : false,

        /**
         * @type Array
         * @default undefined
         */
        children : undefined,

        /**
         * @type Object
         * @default undefined
         */
        transition : undefined,

        /**
         * @type Function
         * @default undefined
         */
        onEnter : undefined,

        /**
         * @type Function
         * @default undefined
         */
        onExit : undefined,

        /**
         * @type Function
         * @default undefined
         */
        onGuardEnter : undefined,

        /**
         * @type Function
         * @default undefined
         */
        onGuardExit : undefined,

        /**
         * @return {Boolean}
         */
        isValid : function(){
            for( var transitionName in this.transition ){
                return true;
            }

            return false;
        }

    };

    /**
     * @class
     * @constructor
     */
    jsfsm.StateMachine = function(){
        this._states = {};
        this._isValidStateData = function( stateData ){
            return jsfsm.StateData.prototype.isValid.apply( stateData );
        }
    };

    jsfsm.StateMachine.prototype = {

        /**
         * @type String
         * @default 'StateMachine'
         */
        fqn : 'StateMachine',

        /**
         *
         * @param {String} stateName
         * @param {Object|jsfsm.StateData} stateData
         * @param {Object} stateData.transition
         * @param {Boolean} [stateData.initial]
         * @param {String[]} [stateData.children]
         * @param {Function} [stateData.onEnter]
         * @param {Function} [stateData.onExit]
         * @param {Function} [stateData.onGuardEnter]
         * @param {Function} [stateData.onGuardExit]
         * @return {jsfsm.StateMachine} the <code>jsfsm.StateMachine</code> instance
         * @throws {Error} 1010, if required param <code>stateName</code> is missing or is not of type <code>string</code>
         * @throws {Error} 1011, if required param <code>stateData</code> is missing
         */
        addState : function( stateName, stateData ){
            if( stateName == undefined || typeof( stateName ) != 'string' ) throw new Error( 1010 );
            if( stateData == undefined ) throw new Error( 1011 );
            if( ! this._isValidStateData( stateData ) ) throw new Error( 1012 );

            this._states[ stateName ] = stateData;

            return this;
        },

        /**
         *
         * @param {String} stateName
         * @return {Boolean}
         * @throws {Error} 1020, if required param <code>stateName</code> is missing or is not of type <code>string</code>
         */
        hasState : function( stateName ){
            if( stateName == undefined || typeof( stateName ) != 'string' ) throw new Error( 1020 );

            return this._states.hasOwnProperty( stateName );
        },

        /**
         *
         * @param {String} stateName
         * @return {Object|jsfsm.StateData|undefined}
         * @throws {Error} 1030, if required param <code>stateName</code> is missing or is not of type <code>string</code>
         */
        getState : function( stateName ){
            if( stateName == undefined || typeof( stateName ) != 'string' ) throw new Error( 1030 );

            return this._states[ stateName ];
        }
    };


    $.jsfsm = jsfsm;

} ( this ) );



