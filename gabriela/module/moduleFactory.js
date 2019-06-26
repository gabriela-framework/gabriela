const Compiler = require('../dependencyInjection/compiler');
const is = require('../util/is');
const hasKey = require('../util/hasKey');
const parseExpression = require('../expression/parse');

function _addDependencies(mdl) {
    const dependencies = mdl.dependencies;

    for (const depInit of dependencies) {
        if (!depInit.scope && !depInit.shared) depInit.scope = 'module';

        if (depInit.scope) {
            if (depInit.scope === 'module') {
                if (!mdl.compiler.hasOwn(depInit.name)) {
                    mdl.compiler.add(depInit);
                }
            } else if (depInit.scope === 'plugin') {
                if (!mdl.compiler.parent) throw new Error(`Dependency injection error. Module '${mdl.name}' has a dependency with name '${depInit.name}' that has a 'plugin' scope but this module is not run within a plugin. Change the visibility of this dependency to 'module' or 'public' or add this module to a plugin`);

                if (!mdl.compiler.parent.hasOwn(depInit.name)) {
                    mdl.compiler.parent.add(depInit);
                }
            } else if (depInit.scope === 'public') {
                if (!mdl.compiler.root.hasOwn(depInit.name)) {
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

function _resolveMiddleware(mdl, config) {
    const middleware = ['security', 'preLogicTransformers', 'validators', 'postLogicTransformers', 'moduleLogic', 'validators'];

    for (const middlewareBlockName of middleware) {
        if (mdl[middlewareBlockName]) {
            const middlewareFns = mdl[middlewareBlockName];
            const newMiddlewareFns = [];

            for (const index in middlewareFns) {
                const n = middlewareFns[index];
                if (is('object', n)) {
                    if (hasKey(n, 'disabled') && n.disabled === true) {
                        continue;
                    }

                    newMiddlewareFns.push(n.middleware);
                } else if (is('string', n)) {
                    const parsed = parseExpression(n);

                    if (!mdl.compiler.has(parsed.fnName)) throw new Error(`Expression dependency injection error. Dependency with name '${parsed.fnName}' not found in the dependency tree`);

                    newMiddlewareFns.push(mdl.compiler.compile(parsed.fnName, mdl.compiler, config));
                } else {
                    newMiddlewareFns.push(n);
                }
            }

            mdl[middlewareBlockName] = newMiddlewareFns;
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
        mediator: mdl.mediator,
        hasMediators: function() {
            return (this.mediator) ? true : false;
        }
    }
}

/**
 * The dependency injection compiler has to be here. It does not have to be instantiated or created here but it has to be
 * here in order for module dependencies to be resolved.
 */
function factory(mdl, config, rootCompiler, parentCompiler, sharedCompiler) {
    mdl = _createModuleModel(mdl);

    // after the _createCompiler() function has been called, nothing on the compiler cannot be touched or modified.
    // the compiler(s) can only be used, not modified
    _createCompiler(mdl, rootCompiler, parentCompiler, sharedCompiler);
    _resolveMiddleware(mdl, config);

    const handlers = {
        set() {
            return undefined;
        },

        get(target, prop) {
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
                'mediator',
                'hasMediators',
            ];

            if (!allowed.includes(prop)) {
                if (!is('string', prop)) return undefined;

                throw new Error(`Module access error. Trying to access a protected or a non existent property '${prop}' of a '${mdl.name}' module`);
            }

            return target[prop];
        }
    };

    return new Proxy(mdl, handlers);
}

module.exports = function(mdl, config, rootCompiler, parentCompiler, sharedCompiler) {
    return new factory(mdl, config, rootCompiler, parentCompiler, sharedCompiler);
};