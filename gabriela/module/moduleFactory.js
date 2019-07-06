const Compiler = require('../dependencyInjection/compiler');
const parseExpression = require('../expression/parse');
const Mediator = require('../events/mediator');
const Emitter = require('../events/emitter');
const {is, hasKey} = require('../util/util');

function _addDependencies(mdl) {
    const {dependencies} = mdl;

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
            const {modules, plugins} = depInit.shared;

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
        hasMediators() {
            return (mdl.mediator) ? true : false;
        },
        hasEmitters() {
            return (mdl.emitter) ? true : false;
        },
        emitter: mdl.emitter,
    };
}

function _bindEventSystem(moduleObject, config, exposedMediator) {
    moduleObject.mediatorInstance = Mediator.create(moduleObject, config);
    moduleObject.emitterInstance = Emitter.create(moduleObject, config);
    moduleObject.exposedMediatorInstance = exposedMediator;
}

/**
 * The dependency injection compiler has to be here. It does not have to be instantiated or created here but it has to be
 * here in order for module dependencies to be resolved.
 */
function factory(mdl, config, rootCompiler, parentCompiler, sharedCompiler, exposedMediator) {
    const moduleObject = _createModuleModel(mdl, config);

    // after the _createCompiler() function has been called, nothing on the compiler cannot be touched or modified.
    // the compiler(s) can only be used, not modified
    _createCompiler(moduleObject, rootCompiler, parentCompiler, sharedCompiler);
    _resolveMiddleware(moduleObject, config);

    _bindEventSystem(moduleObject, config, exposedMediator);

    return moduleObject;
}

module.exports = function(mdl, config, rootCompiler, parentCompiler, sharedCompiler, exposedMediator) {
    return new factory(mdl, config, rootCompiler, parentCompiler, sharedCompiler, exposedMediator);
};