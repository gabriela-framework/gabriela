/**
 * Static functions for validation across the framework
 * @type {(function(*=, *=): (*|*))|*}
 */

const {
    MIDDLEWARE_TYPES,
    MANDATORY_ROUTE_PROPS,
    HTTP_METHODS,
    BUILT_IN_MEDIATORS,
} = require('./types');

const {is, hasKey, isAsyncFn} = require('../util/util');

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

factory.validateModule = function(mdl, Router, plugin) {
    if (!hasKey(mdl, 'name')) throw new Error(`Module definition error. Module has to have a 'name' property as a string that has to be unique to the project`);
    if (!is('string', mdl.name)) throw new Error(`Module definition error. Module 'name' property must to be a string`);

    if (hasKey(mdl, 'modelName')) {
        if (!is('string', mdl.modelName)) throw new Error(`Module definition error in '${mdl.name}'. If present, 'modelName' must be a non empty string`);

        if (mdl.modelName.length <= 0) throw new Error(`Module definition error in '${mdl.name}'. If present, 'modelName' must be a non empty string`);
    }
    /**
     * Traverses the middleware by middleware name and validates that every middleware has to be an array
     * After that, it traverses middleware values and validates that every middleware entry must be a function type
     */
    for (const name of MIDDLEWARE_TYPES) {
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

                            const middleware = m.middleware;

                            if (!is('string', m.name)) throw new Error(`Invalid middleware definition object. '${name}' of module '${mdl.name}' has to have a 'name' property that must be a string`);

                            if (!isAsyncFn(middleware) && !is('function', middleware)) throw new Error(`Invalid middleware definition object. '${name}' of module '${mdl.name}' has to have a 'middleware' property that must be a regular function or an async function. The function name is '${m.name}'.`);
                        } else {
                            if (m.constructor.name === 'AsyncFunction') continue;

                            if (!is('function', m) && !is('string', m)) throw new Error(`Invalid middleware value. '${name}' middleware of '${mdl.name}' module must receive an array of functions or an array of function expressions`);
                        }
                    }
                }
            }
        }
    }

    if (hasKey(mdl, 'mediator')) {
        if (!is('object', mdl.mediator)) throw new Error(`Invalid module definition in module '${mdl.name}'. 'mediator' property must be an object`);

        const mediators = mdl.mediator;
        const props = Object.keys(mediators);

        for (const prop of props) {
            const fn = mediators[prop];

            if (!is('function', fn)) throw new Error(`Invalid module definition in module '${mdl.name}'. 'mediator.${prop}' must be a function`);
        }
    }

    if (hasKey(mdl, 'route')) {
        if (!is('string', mdl.route)) throw new Error(`Invalid module definition with name '${mdl.name}'. 'route' property must be a string`);

        if (!Router.has(mdl.route)) {
            if (plugin) throw new Error(`Invalid module definition with name '${mdl.name}' in plugin '${plugin.name}'. Route '${mdl.route}' does not exist`);

            throw new Error(`Invalid module definition with name '${mdl.name}'. Route '${mdl.route}' does not exist`);
        }
    }

    if (hasKey(mdl, 'http')) {
        throw new Error(`http options is deprecated`);
    }

    validateDependencies(mdl);
};

factory.validateBaseRoute = function(route) {
    if (!is('string', route.name)) throw new Error(`Invalid base route. 'name' must be a string.`);
    if (!is('string', route.basePath)) throw new Error(`Invalid base route '${route.name}'. 'basePath' must be a string.`);
    if (!Array.isArray(route.routes)) throw new Error(`Invalid base route '${route.name}'. 'routes' must be an array.`);

    const routeEntries = Object.keys(route);

    if (routeEntries.length !== 3) throw new Error(`Invalid number of route keys in base path. Expected 'name', 'base' and 'routes' key, got ${routeEntries.join(', ')} for route with name '${route.name}'`);
};

factory.validateRegularRoute = function(route) {
    if (!is('string', route.name)) throw new Error(`Invalid route. 'name' must be a string.`);
    if (!is('string', route.path)) throw new Error(`Invalid route '${route.name}'. 'path' must be a string.`);
    if (!is('string', route.method)) throw new Error(`Invalid route '${route.name}'. 'method' must be a string.`);

    if (hasKey(route, 'static') && !is('object', route.static)) throw new Error(`Invalid route '${route.name}'. 'static' must be an object`);

    if (hasKey(route, 'static')) {
        const staticConfig = route.static;

        if (staticConfig && !is('string', staticConfig.path)) throw new Error(`Invalid route '${route.name}'. 'static.path' must be a string`);
        if (!require('path').isAbsolute(staticConfig.path)) throw new Error(`Invalid route '${route.name}'. 'static.path' must be an absolute path`);
        if (!require('fs').existsSync(staticConfig.path)) throw new Error(`Invalid route '${route.name}'. 'static.path' '${staticConfig.path}' does not exist.`);
    }

    if (!HTTP_METHODS.toArray().includes(route.method.toLowerCase())) throw new Error(`Invalid route '${route.name}'. Invalid method '${route.method}'. Valid method are: '${HTTP_METHODS.toArray().join(', ')}'`);

    const routeEntries = Object.keys(route);

    if (!hasKey(route, 'static')) {
        if (routeEntries.length !== 3) throw new Error(`Invalid number of route keys in base path. Expected 'name', 'base' and 'routes' key, got ${routeEntries.join(', ')} for route with name '${route.name}'`);
    }
};

factory.validatePlugin = function(plugin, Router) {
    if (!is('object', plugin)) throw new Error(`Plugin definition error. Plugin definition has to be an object`);
    if (!hasKey(plugin, 'name')) throw new Error(`Plugin definition error. Plugin definition has to have a 'name' property`);
    if (!is('string', plugin.name)) throw new Error(`Plugin definition error. Plugin 'name' must be a string`);

    if (hasKey(plugin, 'modules')) {
        if (!Array.isArray(plugin.modules)) throw new Error(`Plugin definition error. Plugin with name '${plugin.name}' 'modules' entry must be an array of module objects`);

        try {
            for (const mdl of plugin.modules) {
                factory.validateModule(mdl, Router, plugin);
            }
        } catch (e) {
            throw new Error(`Plugin definition error. Plugin with name '${plugin.name}' has an invalid 'modules' entry with message: '${e.message}'`);
        }
    }

    if (hasKey(plugin, 'mediator')) {
        if (!is('object', plugin.mediator)) throw new Error(`Invalid plugin definition. 'mediator' property must be an object`);

        if (hasKey(plugin.mediator, BUILT_IN_MEDIATORS.ON_PLUGIN_STARTED)) {
            if (!is('function', plugin.mediator[BUILT_IN_MEDIATORS.ON_PLUGIN_STARTED])) throw new Error(`Invalid plugin definition. 'mediator.${BUILT_IN_MEDIATORS.ON_PLUGIN_STARTED}' must be a function`);
        }

        if (hasKey(plugin.mediator, BUILT_IN_MEDIATORS.ON_PLUGIN_FINISHED)) {
            if (!is('function', plugin.mediator[BUILT_IN_MEDIATORS.ON_PLUGIN_FINISHED])) throw new Error(`Invalid plugin definition. 'mediator.${BUILT_IN_MEDIATORS.ON_PLUGIN_FINISHED}' must be a function`);
        }

        const mediators = plugin.mediator;
        const props = Object.keys(mediators);
        const builtInMediators = [
            BUILT_IN_MEDIATORS.ON_PLUGIN_STARTED,
            BUILT_IN_MEDIATORS.ON_PLUGIN_FINISHED,
        ];

        for (const prop of props) {
            if (!builtInMediators.includes(prop)) {
                const fn = mediators[prop];

                if (!is('function', fn)) throw new Error(`Invalid plugin definition. 'mediator.${prop}' must be a function`);
            }
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

    if (hasKey(init, 'cache')) {
        if (!is('boolean', init.cache)) throw new Error(`Dependency injection error for entry 'init.cache' in module '${moduleName}'. 'init.cache' option must be a boolean`);
    }
};

factory.validateRoutes = function(routes) {
    if (!Array.isArray(routes)) throw new Error(`Invalid routes type. Routes must be an array`);

    for (const route of routes) {
        if (!is('object', route)) throw new Error(`Invalid routes type. Routes must be an object`);

        for (const entry of MANDATORY_ROUTE_PROPS) {
            if (!hasKey(route, entry)) throw new Error(`Invalid route. Every route must contain properties '${MANDATORY_ROUTE_PROPS.toArray().join(', ')}'`)
        }

        if (!is('string', route.name)) throw new Error(`Invalid route. 'route.name' must be a string`);
        if (!is('string', route.path)) throw new Error(`Invalid route with name '${route.name}' 'path' property must be a string`);
        if (!is('string', route.method)) throw new Error(`Invalid route with name '${route.name}'. 'method' property must be a string`);

        if (HTTP_METHODS.toArray().includes(route.method.toLowerCase())) throw new Error(`Invalid route with name '${route.name}'. '${route.method}' is not a supported HTTP method. Go to https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods for a list of supported HTTP methods`);
    }
};

module.exports = factory;
