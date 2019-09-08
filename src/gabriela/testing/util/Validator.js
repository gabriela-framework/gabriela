const {is, hasKey} = require('../../util/util');

/**
 * The exception message is self explanatory. This package can only be a static package of static function validators
 */
function factory() {
    throw new Error(`Invalid usage of testing Validator. Validator cannot be used as an instance but only as a static method repository`);
}

factory.validateDependencyGraph = function validateDependencyGraph(dependencyGraph) {
    if (!Array.isArray(dependencyGraph)) throw new Error(`Testing environment invalid argument. Dependency graph must be an array of objects`);

    for (const d of dependencyGraph) {
        if (!is('object', d)) throw new Error(`Testing environment invalid argument. Dependency graph must be an array of objects`);

        factory.validateDefinitionObject(d);
    }
};

factory.validateDefinitionObject = function(init) {
    if (!is('object', init)) throw new Error(`Testing environment invalid argument. Dependency initialization must be an object`);
    if (!is('string', init.name)) throw new Error(`Testing environment invalid argument. Init object 'name' property must be a string`);
    if (!is('function', init.init)) throw new Error(`Testing environment invalid argument. Init object 'init' property must be a function`);

    if (hasKey(init, 'scope') && hasKey(init, 'shared')) throw new Error(`Testing environment invalid argument. Dependency '${init.name}' cannot have both 'visibility' and 'shared' properties present. Use one or another`);

    if (hasKey(init, 'scope')) {
        if (!is('string', init.scope)) throw new Error(`Testing environment invalid argument. '${init.name}' 'scope' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);

        const visibilities = ['module', 'plugin', 'public'];

        if (!visibilities.includes(init.scope)) {
            throw new Error(`Testing environment invalid argument. '${init.name}' 'scope' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);
        }
    }

    if (hasKey(init, 'shared')) {
        if (!is('object', init.shared)) throw new Error(`Testing environment invalid argument. '${init.name}' 'shared' property must be an object`);
        if (!init.shared.plugins && !init.shared.modules) throw new Error(`Testing environment invalid argument. '${init.name}' 'shared' property does not have neither 'modules' or a 'plugins' property`);

        if (init.shared.plugins) {
            if (!Array.isArray(init.shared.plugins)) throw new Error(`Testing environment invalid argument. '${init.name}' 'plugins' property of 'shared' property must be an array`);
        }

        if (init.shared.modules) {
            if (!Array.isArray(init.shared.modules)) throw new Error(`Testing environment invalid argument. '${init.name}' 'modules' property of 'shared' property must be an array`);
        }
    }

    if (hasKey(init, 'isAsync')) {
        if (!is('boolean', init.isAsync)) throw new Error(`Testing environment invalid argument. '${init.name}' 'isAsync' option must be a boolean`);
    }

    if (hasKey(init, 'dependencies')) {
        if (!Array.isArray(init.dependencies)) throw new Error(`Testing environment invalid argument. '${init.name}' 'dependencies' option must be an array of dependency 'init' objects`);

        for (const dep of init.dependencies) {
            factory.validateDefinitionObject(dep);
        }
    }

    if (hasKey(init, 'compilerPass')) {
        if (!is('object', init.compilerPass)) throw new Error(`Testing environment invalid argument for '${init.name}'. 'compilerPass' option must be an object with property 'init' that is required and must be a function and 'property' that is optional and must be a string`);

        const {compilerPass} = init;

        if (!hasKey(compilerPass, 'init')) throw new Error(`Testing environment invalid argument for '${init.name}'. 'compilerPass' option must be an object with property 'init' that is required and must be a function and 'property' that is optional and must be a string`);
        if (!is('function', compilerPass.init)) throw new Error(`Testing environment invalid argument for '${init.name}'. 'compilerPass' option must be an object with property 'init' that is required and must be a function and 'property' that is optional and must be a string`);

        if (hasKey(compilerPass, 'property')) {
            if (!is('string', compilerPass.property)) throw new Error(`Testing environment invalid argument for '${init.name}'. 'compilerPass' option must be an object with property 'init' that is required and must be a function and 'property' that is optional and must be a string`);
        }
    }
};

module.exports = factory;