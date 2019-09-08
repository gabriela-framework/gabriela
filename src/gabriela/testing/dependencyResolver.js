const Validator = require('./util/Validator');
const moduleFactoryContext = require('./moduleFactoryContext');
const Compiler = require('../dependencyInjection/compiler');
const resolveDependencies = require('../dependencyInjection/resolveDependencies');

function _createFakeModule(graph, config) {
    const fakeModule = {
        name: 'testing',
        dependencies: graph,
    };

    const rootCompiler = Compiler.create();
    const sharedCompiler = Compiler.create();
    const parentCompiler = Compiler.create();

    return moduleFactoryContext({
        mdl: fakeModule,
        config,
        rootCompiler,
        parentCompiler,
        sharedCompiler,
    });
}

function DependencyResolver(dependencyGraph, config) {
    Validator.validateDependencyGraph(dependencyGraph);

    const mdl = _createFakeModule(dependencyGraph, config);

    function resolve(name) {
        return resolveDependencies(
            mdl.compiler,
            mdl.sharedCompiler,
            name,
            config,
            mdl.name,
            mdl.plugin
        );
    }

    this.resolve = resolve;
}

module.exports = DependencyResolver;