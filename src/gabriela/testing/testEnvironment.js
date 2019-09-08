const DependencyResolver = require('./dependencyResolver');

function TestEnvironment(config) {
    function loadDependency(dependencyGraph) {
        return new DependencyResolver(dependencyGraph, config);
    }

    function loadModule() {

    }

    function loadPlugin() {

    }

    this.loadDependency = loadDependency;
    this.loadModule = loadModule;
    this.loadPlugin = loadPlugin;
}

module.exports = TestEnvironment;