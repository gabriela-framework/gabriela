const deasync = require('deasync');

const taskRunnerFactory = require('../misc/taskRunner');
const {asyncFlowTypes} = require('../misc/types');
const _waitCheck = require('../util/_waitCheck');

const {getArgs, inArray} = require('../util/util');

function _callEvent(fn) {
    const taskRunner = taskRunnerFactory.create();

    const args = getArgs(fn, {
        next: taskRunner.next,
        throwException: taskRunner.throwException,
    });

    if (!inArray(asyncFlowTypes, args.map((arg) => arg.name))) {
        fn.call(null);

        return;
    }

    fn.call(null, ...args.map((arg) => {
        return arg.value;
    }));

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

function instance() {
    const mediatons = {};

    function mediate(name) {
        const fn = mediatons[name];

        _callEvent(fn);
    }

    function add(name, fn) {
        mediatons[name] = fn;
    }

    function once(fn) {
        _callEvent(fn);
    }

    this.mediate = mediate;
    this.add = add;
    this.once = once;
}

function factory() {
    this.create = function() {
        return new instance();
    };
}

module.exports = new factory();