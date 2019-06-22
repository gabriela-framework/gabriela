const Compiler = require('../dependencyInjection/compiler');
const is = require('../util/is');

function _addDependencies(mdl) {
    const dependencies = mdl.dependencies;
    for (const depInit of dependencies) {
        if (!depInit.scope && !depInit.shared) depInit.scope = 'module';

        if (depInit.scope) {
            if (!mdl.compiler.has(depInit.name)) {
                if (depInit.scope === 'module') {
                    mdl.compiler.add(depInit);
                } else if (depInit.scope === 'plugin') {
                    if (!mdl.compiler.parent) throw new Error(`Dependency injection error. Module '${mdl.name}' has a dependency with name '${depInit.name}' that has a 'plugin' scope but this module is not run within a plugin. Change the visibility of this dependency to 'module' or 'public' or add this module to a plugin`);

                    mdl.compiler.parent.add(depInit);
                } else if (depInit.scope === 'public') {
                    mdl.compiler.root.add(depInit);
                }
            }
        }

        if (depInit.shared) {
            const modules = depInit.shared.modules;
            const plugins = depInit.shared.plugins;

            if (modules) {
                for (const mdlName of modules) {
                    if (mdlName === mdl.name) mdl.sharedCompiler.add(depInit);
                }
            }

            if (plugins && mdl.isInPlugin()) {
                for (const pluginName of plugins) {
                    if (pluginName === mdl.plugin.name) {
                        mdl.sharedCompiler.add(depInit);
                    }
                }
            }
        }
    }
}

function _createCompiler(mdl, rootCompiler, parentCompiler, sharedCompiler) {
    const c = Compiler.create();
    c.name = 'module';
    c.root = rootCompiler;

    if (parentCompiler) c.parent = parentCompiler;

    mdl.compiler = c;
    mdl.sharedCompiler = sharedCompiler;

    if (mdl.dependencies && mdl.dependencies.length > 0) {
        _addDependencies(mdl);
    }
}

function _resolveMiddleware(mdl) {
    const middleware = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'validators', 'security'];

    for (const m of middleware) {
        if (mdl[m]) {
            const middlewareFns = mdl[m];
            const newMiddlewareFns = [];

            for (const index in middlewareFns) {
                const n = middlewareFns[index];
                if (is('object', n)) {
                    if (n.hasOwnProperty('disabled') && n.disabled === true) {
                        continue;
                    }

                    newMiddlewareFns.push(n.middleware);
                } else {
                    newMiddlewareFns.push(n);
                }
            }

            mdl[m] = newMiddlewareFns;
        }
    }
}

function _createModuleModel(mdl) {
    return {
        name: mdl.name,
        security: mdl.security,
        preLogicTransformers: mdl.preLogicTransformers,
        postLogicTransformers: mdl.postLogicTransformers,
        moduleLogic: mdl.moduleLogic,
        validators: mdl.validators,
        plugin: mdl.plugin,
        dependencies: mdl.dependencies,
        isInPlugin: () => !!(mdl.plugin),
    }
}

/**
 * The dependency injection compiler has to be here. It does not have to be instantiated or created here but it has to be
 * here in order for module dependencies to be resolved.
 */
function factory(mdl, rootCompiler, parentCompiler, sharedCompiler) {
    mdl = _createModuleModel(mdl);
    _createCompiler(mdl, rootCompiler, parentCompiler, sharedCompiler);
    _resolveMiddleware(mdl);

    const handlers = {
        set(obj, prop, value) {
            return undefined;
        },

        get(target, prop, receiver) {
            const allowed = [
                'name',
                'security',
                'preLogicTransformers',
                'postLogicTransformers',
                'moduleLogic',
                'validators',
                'compiler',
                'sharedCompiler',
                'plugin',
                'dependencies',
                'isInPlugin',
            ];

            if (!allowed.includes(prop)) {
                throw new Error(`Module access error. Trying to access a protected or a non existent property '${prop}' of a '${mdl.name}' module`);
            }

            return target[prop];
        }
    };

    return new Proxy(mdl, handlers);
}

module.exports = function(mdl, rootCompiler, parentCompiler, sharedCompiler) {
    return new factory(mdl, rootCompiler, parentCompiler, sharedCompiler);
};