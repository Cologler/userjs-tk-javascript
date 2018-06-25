// ==UserScript==
// @name               event-emitter
// @namespace          https://github.com/cologler/
// @version            0.1.0.2
// @description        a simplest event emitter.
// @author             cologler (skyoflw@gmail.com)
// @grant              none
// @license            MIT
// @supportURL         https://github.com/Cologler/monkey-in-zoo-javascript
// ==/UserScript==

// CDN
// greasyfork: https://greasyfork.org/scripts/369577/code/event-emitter.js

const EventEmitter = (() => {
    'use strict';

    /**
     * @typedef Callback
     * @prop {function} func
     * @prop {boolean} once
     * @prop {number} call the func call times
     * @prop {boolean} remove whether the item should be remove.
     */

    class EventEmitter {
        constructor() {
            /** @type {Callback[]} */
            this._callbacks = [];
        }

        _add(func, once) {
            if (typeof func !== 'function') {
                throw new Error('func must be function');
            }

            this._callbacks.push({
                func,
                once,
                call: 0,
            });

            return this;
        }

        on(func) {
            return this._add(func, false);
        }

        once(func) {
            return this._add(func, true);
        }

        off(func) {
            for (let index = this._callbacks.length - 1; index >= 0; index--) {
                const entity = this._callbacks[index];
                if (entity.func === func) {
                    this._callbacks.splice(index, 1);
                    return;
                }
            }
        }

        offall() {
            this._callbacks = [];
        }

        emit(thisArg, ...argArray) {
            try {
                for (const entity of this._callbacks.slice()) {

                    const called = {};
                    const args = argArray.concat({
                        call: ++ entity.call,
                        off: () => called.off = true,
                        stop: () => called.stop = true
                    });

                    try {
                        entity.func.apply(thisArg, args);
                    } finally {
                        entity.remove = called.off || entity.once;
                    }

                    if (called.stop) {
                        break;
                    }
                }
            } finally {
                if (this._callbacks.some(z => z.remove)) {
                    this._callbacks = this._callbacks.filter(z => !z.remove);
                }
            }
        }

        empty() {
            return this._callbacks.length === 0;
        }

        await() {
            const promise = new Promise(resolve => {
                this.once(function() {
                    const args = Array.from(arguments).slice(0, -1); // ignore info because `call` always be 1.
                    resolve({ ctx: this, args });
                });
            });
            return promise;
        }

        get count() {
            return this._callbacks.length;
        }
    }

    return EventEmitter;
})();

(function() {
    for (const e of arguments) {
        if (typeof module === 'object' && module.exports) { // node
            switch (typeof e) {
                case 'function':
                    module.exports = {};
                    module.exports[e.name] = e;
                    break;

                case 'object':
                    module.exports = e;
                    break;
            }
        }
    }
})(EventEmitter);
