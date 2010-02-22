/**
 * Preferences v0.5 by Fourth Draft Software
 * 
 * A class that uses cookies manage versioned Preferences.
 * See README for more information.
 */

var Preferences = Class.create({
    /**
     * A hash of defaults. Uses Prototype Hash.
     */
    defaults: $H(),
    /**
     * The actual preferences hash. Uses Prototype Hash.
     */
    preferences: $H(),
    /**
     * @param {string} cookieName
     * @param {hash} defaults
     * 
     * The initialize function, which is called when "new Preferences()" is
     * called.
     * 
     * Loads the defaults and creates the cookie, then calls load(). Defaults
     * needs to be a built-in hash in the form of
     * {
     *   verNum: {
     *     pref1: default,
     *     pref2: default
     *   },
     *   nextVerNum: {
     *     pref3: default,
     *     pref4: default
     *   }
     * }
     */
    initialize: function(cookieName, defaults) {
        if (!cookieName) {
            throw "InvalidCookieName";
        }
        if (defaults) {
            this.defaults = $H(defaults);
        }
        this.cookie = new Mojo.Model.Cookie(cookieName);
        
        this.load(true);
    },
    /**
     * Sets the version if it doesn't exist, then loops through the defaults
     * and sets preferences that didn't previously exist to their default,
     * increasing the version number as it goes.
     */
    handleVersionDifferences: function() {
        if (!this.preferences.get('version')) {
            this.preferences.set('version', 0);
        }
        var myver = parseInt(this.preferences.get('version'));
        this.defaults.each(function(p) {
            var ver = parseInt(p.key);
            if (myver < ver) {
                this.preferences.set('version', ver);
                $H(p.value).each(function(sp) {
                    // I'm not sure why this if check is here...
                    if (sp.key != 'value') {
                        this.preferences.set(sp.key, sp.value);
                    }
                }.bind(this));
            }
        }.bind(this));
        try {
            this.save();
        } catch (error) {
            throw error;
        }
    },
    /**
     * @param {string} key
     * @return preferences[key]
     */
    get: function(key) {
        return this.preferences.get(key);
    },
    /**
     * @param {string} key
     * @param {mixed} value
     * sets key to value. value can be anything.
     */
    set: function(key, value) {
        this.preferences.set(key, value);
    },
    /**
     * Save the data as JSON to the cookie.
     */
    save: function() {
        this.cookie.put(Object.toJSON(this.preferences));
    },
    /**
     * Unset the cookie.
     */
    clear: function() {
        this.cookie.remove();
    },
    /**
     * Return the preferences as a JSON string.
     */
    toJSON: function() {
       return this.preferences.toJSON();
    },
    /**
     * @param {boolean} versionUpdate
     * Load the cookie; if the cookie doesn't exist, load the defaults
     * through handleVersionDifferences; if it does, set the preferences,
     * but if versionUpdate is true still parse through handleVersionDifferences.
     */
    load: function(versionUpdate) {
        var cv = this.cookie.get();
        if (typeof cv == 'undefined' && this.defaults != null) {
            this.handleVersionDifferences();
        } else {
            this.preferences = $H(cv.evalJSON());
            if (versionUpdate === true) {
                this.handleVersionDifferences();
            }
        }
    }
});