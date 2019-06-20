const TaskRunner = require('../misc/taskRunner');
const deasync = require('deasync');

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
        dependencies: init.dependencies,
        hasDependencies: function() {
            return !!(this.dependencies && this.dependencies.length > 0);
        },
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
    function compile(serviceInit) {
        const dependencies = serviceInit.dependencies;
        const resolvedDependencies = [];

        if (serviceInit.hasDependencies()) {
            for (const dep of dependencies) {
                resolvedDependencies.push(this.compile(_createInitObject(dep)));
            }
        }

        return _resolveService(serviceInit, resolvedDependencies, TaskRunner.create());
    }

    this.compile = compile;
}

module.exports = factory;