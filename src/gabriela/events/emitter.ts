const {getArgs, hasKey, is} = require('../util/util');
const _callFn = require('./util/_callFn');

/**
 * Sends an event to the event loop asynchronously. That means that this event emitter does not wait for anything.
 * It that regards, it acts as a job queue. Promises are sent to the event queue and no one waits for them to finish
 * @param fn
 * @param moduleOrPlugin
 * @param config
 * @param customArgs
 * @private
 */
function _sendEvent(fn, moduleOrPlugin, config, customArgs) {
    new Promise((resolve) => {
        let args = getArgs(fn);

        if (customArgs && is('object', customArgs)) {
            for (const name in customArgs) {
                if (hasKey(customArgs, name)) {
                    for (const arg of args) {
                        if (arg.name === name) arg.value = customArgs[name];
                    }
                }
            }

            args = [...args];
        }

        _callFn(fn, moduleOrPlugin, args, config);

        resolve();
    });
}

function instance(moduleOrPlugin, config) {
    const subscribers = {};

    function emit(name, customArgs) {
        const fns = subscribers[name];

        for (const fn of fns) {
            _sendEvent(fn, moduleOrPlugin, config, customArgs);
        }
    }

    function add(name, fn) {
        if (hasKey(subscribers, name)) throw new Error(`Invalid emitter event. Emitter with name '${name}' already exist`);

        subscribers[name] = fn;
    }

    this.emit = emit;
    this.add = add;
}

/**
 * The factory for the emitter. create() always creates a new emitter.
 */
function factory() {
    this.create = function(moduleOrPlugin, config) {
        return new instance(moduleOrPlugin, config);
    };
}

module.exports = new factory();