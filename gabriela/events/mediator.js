const deasync = require('deasync');

const taskRunnerFactory = require('../misc/taskRunner');
const {asyncFlowTypes} = require('../misc/types');
const _waitCheck = require('../util/_waitCheck');
const resolveDependencies = require('../dependencyInjection/resolveDependencies');

const {getArgs, inArray} = require('../util/util');

function _callFn(fn, mdl, args, config) {
    fn.call(null, ...args.map((arg) => {
        const dep = resolveDependencies(mdl, arg.name, config);

        if (dep) return dep;

        if (!arg.value) throw new Error(`Argument resolving error. Cannot resolve argument with name '${arg.name}'`);

        return arg.value;
    }));
}

function _callEvent(fn, mdl, config) {
    const taskRunner = taskRunnerFactory.create();

    const args = getArgs(fn, {
        next: taskRunner.next,
        throwException: taskRunner.throwException,
    });

    if (!inArray(asyncFlowTypes, args.map((arg) => arg.name))) {
        _callFn(fn, mdl, args, config);

        return;
    }

    _callFn(fn, mdl, args, config);

    while(!(_waitCheck(taskRunner)).success) {
        deasync.sleep(0);
    }

    const task = taskRunner.getTask();

    if (task === 'error') {
        const error = taskRunner.getValue();
        taskRunner.resolve();

        throw error;
    }


    taskRunner.resolve();
}

function instance(mdl, config) {
    const mediatons = {};

    function mediate(name) {
        const fn = mediatons[name];

        _callEvent(fn, mdl);
    }

    function add(name, fn) {
        mediatons[name] = fn;
    }

    function once(fn) {
        _callEvent(fn, mdl);
    }

    this.mediate = mediate;
    this.add = add;
    this.once = once;
}

function factory() {
    this.create = function(mdl, config) {
        return new instance(mdl, config);
    };
}

module.exports = new factory();