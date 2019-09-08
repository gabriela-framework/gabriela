const Validator = require('./util/Validator');

function LoadedDependency(dependencyGraph) {
    Validator.validateDependencyGraph(dependencyGraph);
}

module.exports = LoadedDependency;