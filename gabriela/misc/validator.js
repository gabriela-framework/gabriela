/**
 * Static functions for validation across the framework
 * @type {(function(*=, *=): (*|*))|*}
 */

const is = require('../util/is');
const {middlewareTypes} = require('./types');

/**
 * The exception message is self explanatory. This package can only be a static package of static function validators
 */
function factory() {
    throw new Error(`Invalid usage of Validator. Validator cannot be used as an instance but only as a static method repository`);
}

function validateDependencies(mdl) {
    /**
     * Validates that dependencies have to be an array of type object
     */
    if (mdl.hasOwnProperty('dependencies')) {
        if (!Array.isArray(mdl.dependencies)) throw new Error(`Module definition error in module '${mdl.name}'. 'dependencies' has to be an array of type object`);

        for (const d of mdl.dependencies) {
            if (!is('object', d)) throw new Error(`Module definition error in module '${mdl.name}'. 'dependencies' has to be an array of type object`);

            factory.validateDICompilerInitObject(d, mdl.name);
        }
    }
}

/**
 * Validates
 * @param mdl
 */
factory.moduleValidator = function(mdl) {
    if (!mdl.hasOwnProperty('name')) throw new Error(`Module definition error. Module has to have a 'name' property as a string that has to be unique to the project`);
    if (!is('string', mdl.name)) throw new Error(`Modules definition error. Module 'name' property must to be a string`);

    /**
     * Traverses the middleware by middleware name and validates that every middleware has to be an array
     * After that, it traverses middleware values and validates that every middleware entry must be a function type
     */
    for (const name of middlewareTypes) {
        if (mdl.hasOwnProperty(name)) {
            if (!Array.isArray(mdl[name]) && !is('object', mdl[name])) {
                throw new Error(`Module definition error. '${name}' of '${mdl.name}' module has to be an array of functions or an object with a 'name' property and a 'middleware' property that has to be an array`);
            }

            const middleware = mdl[name];

            if (Array.isArray(middleware)) {
                if (middleware.length > 0) {
                    for (const m of mdl[name]) {
                        if (is('object', m)) {
                            if (m.disabled) {
                                if (!is('boolean', m.disabled)) throw new Error(`Invalid middleware definition object. '${name}' of module '${mdl.name}' 'disabled' property has to be a type boolean`);
                            }
                            if (!m.hasOwnProperty('name')) throw new Error(`Invalid middleware definition object. '${name}' of module '${mdl.name}' has to have a 'name' property that must be a string`);
                            if (!m.hasOwnProperty('middleware')) throw new Error(`Invalid middleware definition object. '${name}' of module '${mdl.name}' has to have a 'middleware' property that must be an array of functions`);

                            if (!is('string', m.name)) throw new Error(`Invalid middleware definition object. '${name}' of module '${mdl.name}' has to have a 'name' property that must be a string`);
                            if (!is('function', m.middleware)) throw new Error(`Invalid middleware definition object. '${name}' of module '${mdl.name}' has to have a 'middleware' property that must be a function`);
                        } else {
                            if (!is('function', m) && !is('string', m)) throw new Error(`Invalid middleware value. '${name}' middleware of '${mdl.name}' module must receive an array of functions or an array of function expressions`);
                        }
                    }
                }
            }
        }
    }

    validateDependencies(mdl);
};

factory.validatePlugin = function(plugin) {
    if (!is('object', plugin)) throw new Error(`Plugin definition error. Plugin definition has to be an object`);
    if (!plugin.hasOwnProperty('name')) throw new Error(`Plugin definition error. Plugin definition has to have a 'name' property`);
    if (!is('string', plugin.name)) throw new Error(`Plugin definition error. Plugin 'name' must be a string`);

    if (plugin.hasOwnProperty('modules')) {
        if (!Array.isArray(plugin.modules)) throw new Error(`Plugin definition error. Plugin with name '${plugin.name}' 'modules' entry must be an array of module objects`);

        try {
            for (const mdl of plugin.modules) {
                factory.moduleValidator(mdl);
            }
        } catch (e) {
            throw new Error(`Plugin definition error. Plugin with name '${plugin.name}' has an invalid 'modules' entry with message: '${e.message}'`);
        }
    }
};

factory.validateServerOptions = function(options) {
    if (options.hasOwnProperty('port')) {
        if (!Number.isInteger(options.port)) throw new Error(`Invalid server configuration. 'port' has to be an integer`);
    }

    if (options.hasOwnProperty('runCallback')) {
        if (!is('function', options.runCallback)) throw new Error(`Invalid server configuration. 'runCallback' must be a function`);
    }
};

factory.validateDICompilerInitObject = function(init, moduleName) {
    if (!is('object', init)) throw new Error(`Dependency injection error in module '${moduleName}'. Dependency initialization must be an object`);
    if (!is('string', init.name)) throw new Error(`Dependency injection error in module '${moduleName}'. Init object 'name' property must be a string`);
    if (!is('function', init.init)) throw new Error(`Dependency injection error in module '${moduleName}'. Init object 'init' property must be a function`);

    if (init.hasOwnProperty('scope') && init.hasOwnProperty('shared')) throw new Error(`Dependency injection error in module '${moduleName}'. Dependency '${init.name}' cannot have both 'visibility' and 'shared' properties present. Use one or another`);

    if (init.hasOwnProperty('scope')) {
        if (!is('string', init.scope)) throw new Error(`Dependency injection error in module '${moduleName}'. '${init.name}' 'visibility' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);

        const visibilities = ['module', 'plugin', 'public'];

        if (!visibilities.includes(init.scope)) {
            throw new Error(`Dependency injection error in module '${moduleName}'. '${init.name}' 'scope' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);
        }
    }

    if (init.hasOwnProperty('shared')) {
        if (!is('object', init.shared)) throw new Error(`Dependency injection error in module '${moduleName}'. '${init.name}' 'shared' property must be an object`);
        if (!init.shared.plugins && !init.shared.modules) throw new Error(`Dependency injection error in module '${moduleName}'. '${init.name}' 'shared' property does not have neither 'modules' or a 'plugins' property`);

        if (init.shared.plugins) {
            if (!Array.isArray(init.shared.plugins)) throw new Error(`Dependency injection error in module '${moduleName}'. '${init.name}' 'plugins' property of 'shared' property must be an array`);
        }

        if (init.shared.modules) {
            if (!Array.isArray(init.shared.modules)) throw new Error(`Dependency injection error in module '${moduleName}'. '${init.name}' 'modules' property of 'shared' property must be an array`);
        }
    }

    if (init.hasOwnProperty('isAsync')) {
        if (!is('boolean', init.isAsync)) throw new Error(`Dependency injection error in module '${moduleName}'. '${init.name}' 'isAsync' option must be a boolean`);
    }

    if (init.hasOwnProperty('dependencies')) {
        if (!Array.isArray(init.dependencies)) throw new Error(`Dependency injection error for '${init.name}' in module '${moduleName}'. '${init.name}' 'dependencies' option must be an array of dependency 'init' objects`);

        for (const dep of init.dependencies) {
            factory.validateDICompilerInitObject(dep, moduleName);
        }
    }
};

module.exports = factory;