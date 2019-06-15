const getArgNames = require('../util/getArgNames');
const is = require('../util/is');
const Validator = require('../misc/validator');
const deasync = require('deasync');
const TaskRunner = require('../misc/taskRunner');

function _waitCheck(taskRunner) {
    const task = taskRunner.getTask();
    if (task) {
        return {
            success: true,
            value: task,
        }
    }

    return {success: false}
}

function _getDependencies(name, serviceInit, taskRunner) {
    const args = getArgNames(serviceInit.init);

    if (serviceInit.isAsync && !args.includes('next')) {
        throw new Error(`Dependency injection error. Invalid service init for dependency with name '${name}'. If a dependency is marked as asynchronous with 'isAsync' option, it has to include 'next' function in the argument list and call it when service construction is ready`);
    }

    const deps = [];
    if (args.length > 0) {
        for (const arg of args) {
            if (arg === 'next') {
                deps.push(taskRunner.next);
            } else {
                deps.push(this.compile(arg));
            }
        }
    }

    return deps;
}

function _resolveService(serviceInit, deps, taskRunner) {
    let service;
    if (serviceInit.isAsync) {
        serviceInit.init(...deps);

        let wait = 0;
        while(!(_waitCheck(taskRunner)).success) {
            wait++;

            // todo: handle timeout on resolving services, maybe some config file?
            /*                if (wait === 1000) {
                                throw new Error(`Dependency injection error. Dependency ${name} waited too long to be resolved`);
                            }*/

            deasync.sleep(0);
        }

        service = taskRunner.getValue().call(null);

        taskRunner.resolve();
    } else {
        service = serviceInit.init(...deps);
    }

    return service;
}
/**
 * Compilers parent is resolved outside of this compiler.
 *
 * Depth:
 *
 * - module -> the deepest possible
 * - plugin -> between module and the root. Modules are its children
 * - framework (public) -> the root compiler. Does not have a parent. Must be self aware.
 *
 * Traversal:
 *
 * Since every dependency will be asked inside a middleware, the first compiler to be asked for a dependency is the
 * modules compiler. If he does not have it, it searches the parent which is the plugin compiler. Plugin compiler has module
 * compiler children. This is a good place to have a shared plugin dependency. The top level is the public level (which is
 * in practice, the framework root compiler). The root compiler is self aware and does not even try to search its parent.
 *
 *
 */
function factory() {
    this.root = null;
    this.parent = null;

    const selfTree = {};
    const resolved = {};

    function add(init) {
        Validator.validateDICompilerInitObject(init);

        selfTree[init.name] = init;
    }

    function has(name) {
        return selfTree.hasOwnProperty(name);
    }

    function compile(name) {
        if (!is('string', name)) throw new Error(`Dependency injection error. 'compile' method expect a string as a name of a dependency that you want to compile`);
        if (resolved.hasOwnProperty(name)) return resolved[name];
        if (!selfTree.hasOwnProperty(name)) throw new Error(`Dependency injection error. ${name} not found in the dependency tree`);

        const serviceInit = selfTree[name];
        const taskRunner = TaskRunner.create();

        const deps = _getDependencies.call(this, ...[name, serviceInit, taskRunner]);
        const service = _resolveService(serviceInit, deps, taskRunner);

        if (!service) throw new Error(`Dependency injection error. Target service ${name} cannot return a falsy value`);

        resolved[serviceInit.name] = service;

        return resolved[serviceInit.name];
    }

    this.add = add;
    this.has = has;
    this.compile = compile;
}

function instance() {
    this.create = function() {
        return new factory();
    }
}

module.exports = new instance();