const Compiler = require('../dependencyInjection/compiler');
const is = require('../util/is');

function _addDependencies(mdl) {
    const dependencies = mdl.dependencies;
    for (const depInit of dependencies) {
        if (!depInit.visibility && !depInit.shared) depInit.visibility = 'module';

        if (depInit.visibility) {
            if (depInit.visibility === 'module') {
                mdl.compiler.add(depInit);
            } else if (depInit.visibility === 'plugin') {
                if (!mdl.compiler.parent) throw new Error(`Dependency injection error. Module '${mdl.name}' has a dependency with name '${depInit.name}' that has a 'plugin' visibility but this module is not run within a plugin. Change the visibility of this dependency to 'module' or 'public' or add this module to a plugin`);

                mdl.compiler.parent.add(depInit);
            } else if (depInit.visibility === 'public') {
                mdl.compiler.root.add(depInit);
            }
        }

        if (depInit.shared) {
            const modules = depInit.shared.modules;
            const plugins = depInit.shared.plugins;

            if (modules) {
                for (const mdlName of modules) {
                    if (mdlName === mdl.name) mdl.compiler.add(depInit);
                }
            }

            if (plugins) {
                for (const pluginName of plugins) {
                    if (pluginName === mdl.plugin.name) {
                        mdl.compiler.parent.add(depInit);
                    }
                }
            }
        }
    }
}

function _createCompiler(mdl, rootCompiler, parentCompiler) {
    const c = Compiler.create();
    c.name = 'module';
    c.root = rootCompiler;

    if (parentCompiler) c.parent = parentCompiler;

    mdl.compiler = c;

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
/**
 * The dependency injection compiler has to be here. It does not have to be instantiated or created here but it has to be
 * here in order for module dependencies to be resolved.
 */
function factory(mdl, rootCompiler, parentCompiler) {
    _createCompiler(mdl, rootCompiler, parentCompiler);
    _resolveMiddleware(mdl);

    const handlers = {
        set(obj, prop, value) {
            return undefined;
        },

        get(target, prop, receiver) {
            const allowed = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'validators', 'compiler', 'plugin'];

            if (!allowed.includes(prop)) {
                throw new Error(`Module access error. Trying to access protected property '${prop}' of a module`);
            }

            return target[prop];
        }
    };

    return new Proxy(mdl, handlers);
}

module.exports = function(mdl, rootCompiler, parentCompiler) {
    return new factory(mdl, rootCompiler, parentCompiler);
};