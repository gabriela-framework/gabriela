const TaskRunner = require('../misc/taskRunner');

const _resolveService = require('./_resolveService');
const _createDefinitionObject = require('./_createDefinitionObject');

/**
 * Compiles a dependency recursively in the same way that the Compiler does but does not save them.
 * Private dependencies are prevalidated before adding them to the compiler
 */
function factory() {
    function compile(definition) {
        const {dependencies} = definition;
        const resolvedDependencies = [];

        if (definition.hasDependencies()) {
            for (const dep of dependencies) {
                resolvedDependencies.push(this.compile(_createDefinitionObject(dep)));
            }
        }

        const serviceMetadata = _resolveService(definition, resolvedDependencies, TaskRunner.create());

        if (serviceMetadata.isError) {
            throw serviceMetadata.error;
        }

        return serviceMetadata.service;
    }

    this.compile = compile;
}

module.exports = factory;