const {getArgs, hasKey} = require('../util/util');
const _callFn = require('./_callFn');

function instance(moduleOrPlugin, config) {
    const subscribers = {};

    function emit(name) {
        const fns = subscribers[name];

        for (const fn of fns) {
            new Promise((resolve) => {
                _callFn(fn, moduleOrPlugin, getArgs(fn), config);

                resolve();
            });
        }
    }

    function add(name, fn) {
        if (hasKey(subscribers, name)) throw new Error(`Invalid emitter event. Emitter with name '${name}' already exist`);

        subscribers[name] = fn;
    }

    this.emit = emit;
    this.add = add;
}

function factory(moduleOrPlugin, config) {
    this.create = function() {
        return new instance(moduleOrPlugin, config);
    };
}

module.exports = new factory();