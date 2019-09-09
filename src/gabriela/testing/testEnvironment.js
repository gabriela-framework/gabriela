const DependencyResolver = require('./resolver/dependencyResolver');
const ModuleResolver = require('./resolver/moduleResolver');

function TestEnvironment(config) {
    function loadDependency(dependencyGraph) {
        return new DependencyResolver(dependencyGraph, config);
    }

    function loadModule(mdl) {
        return new ModuleResolver(mdl);
    }

    function loadPlugin() {

    }

    this.loadDependency = loadDependency;
    this.loadModule = loadModule;
    this.loadPlugin = loadPlugin;
}

module.exports = TestEnvironment;