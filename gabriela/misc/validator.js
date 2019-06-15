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

function validateDependencies(value) {
    /**
     * Validates that dependencies have to be an array of type object
     */
    if (value.hasOwnProperty('dependencies')) {
        if (!Array.isArray(value.dependencies)) throw new Error(`Module definition error. 'dependencies' has to be an array of type object`);

        for (const d of value.dependencies) {
            if (!is('object', d)) throw new Error(`Module definition error. 'dependencies' has to be an array of type object`);
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
                            if (!is('function', m)) throw new Error(`Invalid middleware value. '${name}' middleware of '${mdl.name}' module must receive an array of functions`);
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

    validateDependencies(plugin);
};

factory.validateServerOptions = function(options) {
    if (options.hasOwnProperty('port')) {
        if (!Number.isInteger(options.port)) throw new Error(`Invalid server configuration. 'port' has to be an integer`);
    }

    if (options.hasOwnProperty('runCallback')) {
        if (!is('function', options.runCallback)) throw new Error(`Invalid server configuration. 'runCallback' must be a function`);
    }
};

factory.validateDICompilerInitObject = function(init) {
    if (!is('object', init)) throw new Error(`Dependency injection error. Dependency initialization must be an object`);
    if (!is('string', init.name)) throw new Error(`Dependency injection error. Init object 'name' property must be a string`);
    if (!is('function', init.init)) throw new Error(`Dependency injection error. Init object 'init' property must be a function`);
    if (init.hasOwnProperty('visibility')) {
        if (!is('string', init.visibility)) throw new Error(`Dependency injection error. 'visibility' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);

        const visibilities = ['module', 'plugin', 'public'];

        if (!visibilities.includes(init.visibility)) {
            throw new Error(`Dependency injection error. 'visibility' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);
        }
    }

    if (init.hasOwnProperty('isAsync')) {
        if (!is('boolean', init.isAsync)) throw new Error(`Dependency injection error. 'isAsync' option must be a boolean`);

    }
};

module.exports = factory;