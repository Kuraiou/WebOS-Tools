/**
 * AssistantBase v1.0 by Fourth Draft Software
 * 
 * A simple base class to inherit from for assistants, to simplify usage.
 * See README for more information.
 */

var AssistantBase = Class.create({
    /**
     * The basic initialize function required of all classes.
     */
    initialize: function() {},
    /**
     * A hash of listeners added via addListener.
     */
    listeners: {},
    /**
     * A hash of listeners added via addActivateListener.
     */
    activateListeners: {},
    /**
     * When setup is called, it checks through every function in the class.
     * If a function begins with setup (e.g. setupButton), it will call that
     * function. If it begins with do (e.g. doSelectUser) it will bind the
     * 'this' context to that user.
     * 
     * setup occurs automatically the first time an assistant is called.
     */
    setup: function() {
        for (i in this) {
            if (typeof this[i] == 'function') {
                if (i.indexOf('setup') == 0 && i.length > 'setup'.length) {
                    this[i].call(this);
                } else if (i.indexOf('do') == 0 && i.length > 'do'.length) {
                    this[i] = this[i].bind(this);
                }
            }
        }
    },
    /**
     * @param {Object} event
     * The activate function is called every time the scene is made active.
     */
    activate: function(event) {},
    /**
     * @param {Object} event
     * 
     * Deactivate loops through the activateListeners that have been added and
     * stops listening to them.
     * 
     * The deactivate function is called every time the scene is deactivated.
     */
    deactivate: function(event) {
        for (i in this.activateListeners) {
            var l = this.activateListeners[i];
            Mojo.Event.stopListening(this.controller.get(i), l.event, l.func);
        }
    },
    /**
     * Cleanup loops through the listeners added via addListener and stops
     * listening to them.
     * 
     * Cleanup is called when the card is closing for the last time.
     */
    cleanup: function() {
        for (i in this.listeners) {
            var l = this.listeners[i];
            Mojo.Event.stopListening(this.controller.get(i), l.event, l.func);
        }
    },
    /**
     * @param {string} id
     * @param {string} eventname
     * @param {string|function} func
     * @param {boolean} activateLevel
     * 
     * addListener replaces the standard Mojo.Event.listen() function by
     * binding the function to the 'this' context and keeping track of it,
     * so that it can be stopped during cleanup.
     */
    addListener: function(id, eventname, func, activateLevel) {
        var f = null;
        if (typeof func == 'function') {
            func = func.bind(this);
            f = func;
        } else {
            this[func] = this[func].bind(this);
            f = this[func];
        }
        Mojo.Event.listen(this.controller.get(id), eventname, f);
        if (activateLevel) {
            this.activateListeners[id] = { event: eventname, func: f };
        } else {
            this.listeners[id] = { event: eventname, func: f };
        }
    },
    /**
     * @param {string} id
     * @param {string} eventname
     * @param {string|function} func
     * 
     * as addListener, but specifically should be called when you want to listen
     * on something during activate() events.
     */
    addActivateListener: function(id, eventname, func) {
        this.addListener(id, eventname, func, true);
    },
    /**
     * @param {string} title
     * @param {string} message
     * 
     * Helper function to show a dialog box with an 'ok' button.
     */
    showDialogBox: function(title, message){
        this.controller.showAlertDialog({
            onChoose: function(value){
            },
            title: title,
            message: message,
            choices: [{
                label: 'OK',
                value: 'OK',
                type: 'color'
            }]
        });
    },
    /**
     * @param {string} title
     * @param {string} message
     * @param {hash|function} eventTrigge
     * 
     * Helper function to show an ok/cancel dialog; if 'ok' is selected,
     * call onApprove.
     */    
    showOkCancelBox: function(title, message, onApprove) {
        if (typeof eventTrigger == 'undefined') {
            return false;
        }
        this.controller.showAlertDialog({
            onChoose: function(value) {
                Mojo.Log.info('selected a value, value is', value);
                if (value == 'OK') {
                    onApprove();
                }
            },
            title: title,
            message: message,
            choices: [
                { label: 'OK', value: 'OK', type: 'affirmative' },
                { label: 'Cancel', value: 'Cancel', type: 'negative' }
            ]
        });
    }
});