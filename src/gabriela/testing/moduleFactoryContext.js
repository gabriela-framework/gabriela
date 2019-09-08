const Compiler = require('../dependencyInjection/compiler');
const _addDependencies = require('../module/dependencyInjection/_addDependencies');

function _createCompiler(mdl, rootCompiler, parentCompiler, sharedCompiler, config) {
    const c = Compiler.create();
    c.name = 'module';
    c.root = rootCompiler;

    if (parentCompiler) c.parent = parentCompiler;

    mdl.compiler = c;
    mdl.sharedCompiler = sharedCompiler;

    if (mdl.dependencies && mdl.dependencies.length > 0) {
        _addDependencies(mdl, config);
    }
}

function _createModuleModel(mdl) {
    return {
        name: mdl.name,
        plugin: mdl.plugin,
        dependencies: mdl.dependencies,
        isInPlugin: () => !!(mdl.plugin),
    };
}

/**
 * The dependency injection compiler has to be here. It does not have to be instantiated or created here but it has to be
 * here in order for module dependencies to be resolved.
 */
function factory({mdl, config, rootCompiler, parentCompiler, sharedCompiler}) {
    const moduleObject = _createModuleModel(mdl, config);

    // after the _createCompiler() function has been called, nothing on the compiler cannot be touched or modified.
    // the compiler(s) can only be used, not modified
    _createCompiler(moduleObject, rootCompiler, parentCompiler, sharedCompiler, config);

    return moduleObject;
}

module.exports = function(buildStageArgs) {
    return new factory(buildStageArgs);
};