const Compiler = require('../dependencyInjection/compiler');
const is = require('../util/is');
const getArgNames = require('../util/getArgNames');
const { asyncFlowTypes } = require('../misc/types');

function _addDependencies(mdl, compiler) {
    for (const depInit of mdl.dependencies) {
        if (!depInit.visibility) depInit.visibility = 'module';

        if (depInit.visibility === 'module') {
            compiler.add(depInit);
        } else if (depInit.visibility === 'plugin') {
            if (!compiler.parent) throw new Error(`Dependency injection error. Module '${mdl.name}' has a dependency with name '${depInit.name}' that has a 'plugin' visibility but this module is not run within a plugin. Change the visibility of this dependency to 'module' or 'public' or add this module to a plugin`);

            compiler.parent.add(depInit);
        } else if (depInit.visibility === 'public') {
            compiler.root.add(depInit);
        }
    }
}

/**
 *
 * A pre check checks if the dependencies can be resolved in the future.
 *
 * Rules:
 */
function _dependencyPreCheck(mdl) {
    if (mdl.dependencies) {
        const dependencies = mdl.dependencies;
        const flatMap = dependencies.map((val) => {
            return val.name;
        });

        for (const depInit of dependencies) {
            const argNames = getArgNames(depInit.init);
            const depsNotFound = [];

            argNames.forEach((val) => {
                if (!flatMap.includes(val) && !asyncFlowTypes.includes(val)) depsNotFound.push(val);
            });

            if (depsNotFound.length > 0) {
                throw new Error(`Dependency injection precompile check error. Could not find dependencies '${depsNotFound.join(',')}' for service '${depInit.name}' in module '${mdl.name}'`);
            }
        }

    }
}

function _createCompiler(mdl, rootCompiler, parentCompiler) {
    const c = Compiler.create();
    c.root = rootCompiler;

    if (parentCompiler) c.parent = parentCompiler;

    if (mdl.dependencies && mdl.dependencies.length > 0) {
        _addDependencies(mdl, c);
    }

    mdl.compiler = c;
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
    _dependencyPreCheck(mdl);
    _createCompiler(mdl, rootCompiler, parentCompiler);
    _resolveMiddleware(mdl);

    const handlers = {
        set(obj, prop, value) {
            return undefined;
        },

        get(target, prop, receiver) {
            const allowed = ['preLogicTransformers', 'postLogicTransformers', 'moduleLogic', 'validators', 'compiler'];

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