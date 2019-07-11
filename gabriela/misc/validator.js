/**
 * Static functions for validation across the framework
 * @type {(function(*=, *=): (*|*))|*}
 */

const {middlewareTypes, mandatoryRouteProps, httpMethods} = require('./types');

const {is, hasKey} = require('../util/util');

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
    if (hasKey(mdl, 'dependencies')) {
        if (!Array.isArray(mdl.dependencies)) throw new Error(`Module definition error in module '${mdl.name}'. 'dependencies' has to be an array of type object`);

        for (const d of mdl.dependencies) {
            if (!is('object', d)) throw new Error(`Module definition error in module '${mdl.name}'. 'dependencies' has to be an array of type object`);

            factory.validateDefinitionObject(d, mdl.name);
        }
    }
}

/**
 * Validates
 * @param mdl
 */
factory.moduleValidator = function(mdl) {
    if (!hasKey(mdl, 'name')) throw new Error(`Module definition error. Module has to have a 'name' property as a string that has to be unique to the project`);
    if (!is('string', mdl.name)) throw new Error(`Modules definition error. Module 'name' property must to be a string`);

    /**
     * Traverses the middleware by middleware name and validates that every middleware has to be an array
     * After that, it traverses middleware values and validates that every middleware entry must be a function type
     */
    for (const name of middlewareTypes) {
        if (hasKey(mdl, name)) {
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
                            if (!hasKey(m, 'name')) throw new Error(`Invalid middleware definition object. '${name}' of module '${mdl.name}' has to have a 'name' property that must be a string`);
                            if (!hasKey(m, 'middleware')) throw new Error(`Invalid middleware definition object. '${name}' of module '${mdl.name}' has to have a 'middleware' property that must be an array of functions`);

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

    if (hasKey(mdl, 'mediator')) {
        if (!is('object', mdl.mediator)) throw new Error(`Invalid module definition. 'mediator' property must be an object`);

        if (hasKey(mdl.mediator, 'onModuleStarted')) {
            if (!is('function', mdl.mediator.onModuleStarted)) throw new Error(`Invalid module definition. 'mediator.onModuleStarted' must be a function`);
        }

        if (hasKey(mdl.mediator, 'onModuleFinished')) {
            if (!is('function', mdl.mediator.onModuleFinished)) throw new Error(`Invalid module definition. 'mediator.onModuleFinished' must be a function`);
        }

        if (hasKey(mdl.mediator, 'onError')) {
            if (!is('function', mdl.mediator.onError)) throw new Error(`Invalid module definition. 'mediator.onError' must be a function`);
        }

        const mediators = mdl.mediator;
        const props = Object.keys(mediators);
        const builtInMediators = [
            'onModuleStarted',
            'onModuleFinished',
            'onError',
        ];

        for (const prop of props) {
            if (!builtInMediators.includes(prop)) {
                const fn = mediators[prop];

                if (!is('function', fn)) throw new Error(`Invalid module definition. 'mediator.${prop}' must be a function`);
            }
        }
    }

    if (hasKey(mdl, 'http')) {
        const {http} = mdl;

        if (!is('object', http)) throw new Error(`Invalid module definition in module '${mdl.name}'. 'http' property must be an object`);

        if (!hasKey(http, 'route')) throw new Error(`Invalid module definition in module '${mdl.name}'. 'http.route' property must exist and be an object if the 'http' property exists`);

        if (!is('object', http.route)) throw new Error(`Invalid module definition in module '${mdl.name}'. 'http.route' must be an object`);

        for (const entry of mandatoryRouteProps) {
            if (!hasKey(http.route, entry)) throw new Error(`Invalid module definition in module '${mdl.name}'. 'http.route' must contain properties '${mandatoryRouteProps.join(', ')}'`)
        }

        if (!is('string', http.route.name)) throw new Error(`Invalid module definition in module '${mdl.name}'. 'http.route.name' must be a string`);
        if (!is('string', http.route.path)) throw new Error(`Invalid module definition in module '${mdl.name}'. 'http.route.path' must be a string`);
        if (!is('string', http.route.method)) throw new Error(`Invalid module definition in module '${mdl.name}'. 'http.route.method' must be a string`);

        if (!httpMethods.includes(http.route.method.toLowerCase())) throw new Error(`Invalid module definition in module '${mdl.name}'. ${http.route.method} is not a supported HTTP method. Go to http://restify.com/docs/server-api/ for a list of supported HTTP methods`);
    }

    validateDependencies(mdl);
};

factory.validatePlugin = function(plugin) {
    if (!is('object', plugin)) throw new Error(`Plugin definition error. Plugin definition has to be an object`);
    if (!hasKey(plugin, 'name')) throw new Error(`Plugin definition error. Plugin definition has to have a 'name' property`);
    if (!is('string', plugin.name)) throw new Error(`Plugin definition error. Plugin 'name' must be a string`);

    if (hasKey(plugin, 'modules')) {
        if (!Array.isArray(plugin.modules)) throw new Error(`Plugin definition error. Plugin with name '${plugin.name}' 'modules' entry must be an array of module objects`);

        try {
            for (const mdl of plugin.modules) {
                factory.moduleValidator(mdl);
            }
        } catch (e) {
            throw new Error(`Plugin definition error. Plugin with name '${plugin.name}' has an invalid 'modules' entry with message: '${e.message}'`);
        }
    }

    if (hasKey(plugin, 'mediator')) {
        if (!is('object', plugin.mediator)) throw new Error(`Invalid plugin definition. 'mediator' property must be an object`);

        if (hasKey(plugin.mediator, 'onPluginStarted')) {
            if (!is('function', plugin.mediator.onPluginStarted)) throw new Error(`Invalid plugin definition. 'mediator.onPluginStarted' must be a function`);
        }

        if (hasKey(plugin.mediator, 'onPluginFinished')) {
            if (!is('function', plugin.mediator.onPluginFinished)) throw new Error(`Invalid plugin definition. 'mediator.onPluginFinished' must be a function`);
        }

        const mediators = plugin.mediator;
        const props = Object.keys(mediators);
        const builtInMediators = [
            'onPluginStarted',
            'onPluginFinished',
        ];

        for (const prop of props) {
            if (!builtInMediators.includes(prop)) {
                const fn = mediators[prop];

                if (!is('function', fn)) throw new Error(`Invalid plugin definition. 'mediator.${prop}' must be a function`);
            }
        }
    }

    if (hasKey(plugin, 'plugins')) {
        if (!Array.isArray(plugin.plugins)) throw new Error(`Invalid plugin definition in plugin '${plugin.name}'. 'plugins' property must be an array of plugin definitions`);

        for (const p of plugin.plugins) {
            factory.validatePlugin(p);
        }
    }

    if (hasKey(plugin, 'exposedMediators')) {
        if (!Array.isArray(plugin.exposedMediators)) throw new Error(`Invalid plugin definition in plugin '${plugin.name}'. 'exposedMediators' must be an array`);

        const {exposedMediators} = plugin;

        for (const event of exposedMediators) {
            if (!is('string', event)) throw new Error(`Invalid exposed event definition in plugin '${plugin.name}'. Every entry in 'exposedMediators' must be a string`);
        }
    }
};

factory.validateServerOptions = function(options) {
    if (options) {
        if (hasKey(options, 'port')) {
            if (!Number.isInteger(options.port)) throw new Error(`Invalid server configuration. 'port' has to be an integer`);
        }

        if (hasKey(options, 'runCallback')) {
            if (!is('function', options.runCallback)) throw new Error(`Invalid server configuration. 'runCallback' must be a function`);
        }
    }
};

factory.validateDefinitionObject = function(init, moduleName) {
    if (!is('object', init)) throw new Error(`Dependency injection error in module '${moduleName}'. Dependency initialization must be an object`);
    if (!is('string', init.name)) throw new Error(`Dependency injection error in module '${moduleName}'. Init object 'name' property must be a string`);
    if (!is('function', init.init)) throw new Error(`Dependency injection error in module '${moduleName}'. Init object 'init' property must be a function`);

    if (hasKey(init, 'scope') && hasKey(init, 'shared')) throw new Error(`Dependency injection error in module '${moduleName}'. Dependency '${init.name}' cannot have both 'visibility' and 'shared' properties present. Use one or another`);

    if (hasKey(init, 'scope')) {
        if (!is('string', init.scope)) throw new Error(`Dependency injection error in module '${moduleName}'. '${init.name}' 'visibility' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);

        const visibilities = ['module', 'plugin', 'public'];

        if (!visibilities.includes(init.scope)) {
            throw new Error(`Dependency injection error in module '${moduleName}'. '${init.name}' 'scope' property needs to be either 'module', 'plugin' or 'public'. If not specified, it is 'module' by default`);
        }
    }

    if (hasKey(init, 'shared')) {
        if (!is('object', init.shared)) throw new Error(`Dependency injection error in module '${moduleName}'. '${init.name}' 'shared' property must be an object`);
        if (!init.shared.plugins && !init.shared.modules) throw new Error(`Dependency injection error in module '${moduleName}'. '${init.name}' 'shared' property does not have neither 'modules' or a 'plugins' property`);

        if (init.shared.plugins) {
            if (!Array.isArray(init.shared.plugins)) throw new Error(`Dependency injection error in module '${moduleName}'. '${init.name}' 'plugins' property of 'shared' property must be an array`);
        }

        if (init.shared.modules) {
            if (!Array.isArray(init.shared.modules)) throw new Error(`Dependency injection error in module '${moduleName}'. '${init.name}' 'modules' property of 'shared' property must be an array`);
        }
    }

    if (hasKey(init, 'isAsync')) {
        if (!is('boolean', init.isAsync)) throw new Error(`Dependency injection error in module '${moduleName}'. '${init.name}' 'isAsync' option must be a boolean`);
    }

    if (hasKey(init, 'dependencies')) {
        if (!Array.isArray(init.dependencies)) throw new Error(`Dependency injection error for '${init.name}' in module '${moduleName}'. '${init.name}' 'dependencies' option must be an array of dependency 'init' objects`);

        for (const dep of init.dependencies) {
            factory.validateDefinitionObject(dep, moduleName);
        }
    }

    if (hasKey(init, 'compilerPass')) {
        if (!is('object', init.compilerPass)) throw new Error(`Dependency injection error for '${init.name}' in module '${moduleName}'. 'compilerPass' option must be an object with property 'init' that is required and must be a function and 'property' that is optional and must be a string`);

        const {compilerPass} = init;

        if (!hasKey(compilerPass, 'init')) throw new Error(`Dependency injection error for '${init.name}' in module '${moduleName}'. 'compilerPass' option must be an object with property 'init' that is required and must be a function and 'property' that is optional and must be a string`);
        if (!is('function', compilerPass.init)) throw new Error(`Dependency injection error for '${init.name}' in module '${moduleName}'. 'compilerPass' option must be an object with property 'init' that is required and must be a function and 'property' that is optional and must be a string`);

        if (hasKey(compilerPass, 'property')) {
            if (!is('string', compilerPass.property)) throw new Error(`Dependency injection error for '${init.name}' in module '${moduleName}'. 'compilerPass' option must be an object with property 'init' that is required and must be a function and 'property' that is optional and must be a string`);
        }
    }
};

module.exports = factory;