const TaskRunner = require('../misc/taskRunner');

const _resolveService = require('./_resolveService');
const _createInitObject = require('./_createInitObject');

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