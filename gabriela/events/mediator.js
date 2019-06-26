const deasync = require('deasync');

const taskRunnerFactory = require('../misc/taskRunner');
const {asyncFlowTypes} = require('../misc/types');
const inArray = require('../util/inArray');
const _waitCheck = require('../util/_waitCheck');
const getArgs = require('../util/getArgs');

function _callEvent(fn) {
    const taskRunner = taskRunnerFactory.create();

    let args = getArgs(fn, {
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

    let wait = 0;
    while(!(_waitCheck(taskRunner)).success) {
        wait++;

        // todo: handle timeout on resolving services, maybe some config file?
        /*                if (wait === 1000) {
                            throw new Error(`Dependency injection error. Dependency ${name} waited too long to be resolved`);
                        }*/

        deasync.sleep(0);
    }

    taskRunner.resolve();
}

function factory() {
    const mediatons = {};

    function mediate(name) {

    }

    function add(name, fn) {

    }
}