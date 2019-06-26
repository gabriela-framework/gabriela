const TaskRunner = require('../misc/taskRunner');

const _resolveService = require('./_resolveService');
const _createDefinitionObject = require('./_createDefinitionObject');

function factory() {
    function compile(definition) {
        const dependencies = definition.dependencies;
        const resolvedDependencies = [];

        if (definition.hasDependencies()) {
            for (const dep of dependencies) {
                resolvedDependencies.push(this.compile(_createDefinitionObject(dep)));
            }
        }

        return _resolveService(definition, resolvedDependencies, TaskRunner.create());
    }

    this.compile = compile;
}

module.exports = factory;