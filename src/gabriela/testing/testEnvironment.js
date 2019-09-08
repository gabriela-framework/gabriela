const LoadedDependency = require('./loadedDependency');

function TestEnvironment(config) {
    function loadDependency(dependencyGraph) {
        return LoadedDependency(dependencyGraph);
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