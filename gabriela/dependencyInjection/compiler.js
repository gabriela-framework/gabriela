const getArgNames = require('../util/getArgNames');
const is = require('../util/is');
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

function _getDependencies(name, serviceInit, taskRunner, originalCompiler) {
    const args = getArgNames(serviceInit.init);

    if (serviceInit.isAsync && !args.includes('next')) throw new Error(`Dependency injection error. Invalid service init for dependency with name '${name}'. If a dependency is marked as asynchronous with 'isAsync' option, it has to include 'next' function in the argument list and call it when service construction is ready`);

    const deps = [];
    if (args.length > 0) {
        for (const arg of args) {
            if (arg === 'next') {
                deps.push(taskRunner.next);
            } else {
                deps.push(originalCompiler.compile(arg));
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

function _createInitObject(init) {
    return {
        name: init.name,
        init: init.init,
        isAsync: init.isAsync,
        visibility: init.visibility,
        hasVisibility: function() {
            return (this.visibility) ? true : false;
        },
        isShared: function() {
            return (this.shared) ? true : false;
        },
        shared: init.shared,
        sharedPlugins: function() {
            if (this.shared.plugins) return this.shared.plugins;
        },
        sharedModules: function() {
            if (this.shared.modules) return this.shared.modules;
        },
        isSharedWith(moduleOrPluginName) {
            if (!this.isShared()) return false;

            const sharedModules = this.sharedModules();
            const sharedPlugins = this.sharedPlugins();

            let isShared = false;
            if (sharedModules) {
                isShared = sharedModules.includes(moduleOrPluginName);
            }

            if (sharedModules && !isShared) {
                isShared = sharedPlugins.includes(moduleOrPluginName);
            }

            return isShared;
        }
    }
}

function factory() {
    this.root = null;
    this.parent = null;
    this.name = null;

    const selfTree = {};
    const resolved = {};

    function add(init) {
        selfTree[init.name] = _createInitObject(init);
    }

    function getInit(name) {
        if (!has(name)) throw new Error(`Dependency injection error. Init object with name '${name}' not found`);

        return selfTree[name];
    }

    function has(name) {
        if (selfTree.hasOwnProperty(name)) return true;
        if (this.parent && this.parent.has(name)) return true;
        if (this.root && this.root.has(name)) return true;

        return false;
    }

    function isResolved(name) {
        if (resolved.hasOwnProperty(name)) return true;
        if (this.parent && this.parent.isResolved(name)) return true;
        if (this.root && this.root.isResolved(name)) return true;

        return false;
    }

    function compile(name, originCompiler) {
        if (!originCompiler && this.name === 'module') originCompiler = this;

        if (!is('string', name)) throw new Error(`Dependency injection error. 'compile' method expect a string as a name of a dependency that you want to compile`);
        if (resolved.hasOwnProperty(name)) return resolved[name];

        let serviceInit;

        if (selfTree.hasOwnProperty(name)) {
            serviceInit = selfTree[name];
        } else if (this.parent && this.parent.has(name)) {
            return this.parent.compile(name, originCompiler);
        } else if (this.root && this.root.has(name)) {
            return this.root.compile(name, originCompiler);
        }

        if (!serviceInit) throw new Error(`Dependency injection error. '${name}' not found in the dependency tree`);

        const taskRunner = TaskRunner.create();

        const deps = _getDependencies.call(this, ...[name, serviceInit, taskRunner, originCompiler]);
        const service = _resolveService(serviceInit, deps, taskRunner);

        if (!service) throw new Error(`Dependency injection error. Target service ${name} cannot return a falsy value`);

        resolved[serviceInit.name] = service;

        return resolved[serviceInit.name];
    }

    this.add = add;
    this.has = has;
    this.isResolved = isResolved;
    this.getInit = getInit;
    this.compile = compile;
}

function instance() {
    this.create = function() {
        return new factory();
    }
}

module.exports = new instance();