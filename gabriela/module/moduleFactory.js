const Compiler = require('../dependencyInjection/compiler');
const parseExpression = require('../expression/parse');
const Mediator = require('../events/mediator');
const Emitter = require('../events/emitter');
const {is, hasKey} = require('../util/util');
const {MIDDLEWARE_TYPES} = require('../misc/types');
const deepCopy = require('deepcopy');
const Validator = require('../misc/validator');

function _compileAddProxy(mdl, config) {
    return function(definition) {
        Validator.validateDefinitionObject(definition);

        _addDependency(mdl, definition, config);
    }
}

function _execCompilerPass(mdl, definition, config, addProxy) {
    const {compilerPass} = definition;

    const handlers = {
        set() { return undefined; },

        get(target, prop) {
            if (prop === 'compile') throw new Error(`Dependency injection error in service '${definition.name}'. Compiling inside a compiler pass is forbidden`);

            if (prop === 'add') return addProxy;
            return target[prop];
        }
    };

    let possibleConfig = config;
    if (compilerPass.property) {
        if (!hasKey(config.config, compilerPass.property)) throw new Error(`Dependency injection error in a compiler pass in service '${definition.name}'. Property '${compilerPass.property}' does not exist in config`);

        possibleConfig = config.config[compilerPass.property];
    }

    compilerPass.init.call(null, ...[deepCopy(possibleConfig), new Proxy(this, handlers)]);
}

function _addDependency(mdl, definition, config) {
    if (!definition.scope && !definition.shared) definition.scope = 'module';

    if (definition.scope) {
        if (definition.scope === 'module') {
            if (!mdl.compiler.hasOwn(definition.name)) {
                mdl.compiler.add(definition);
            }
        } else if (definition.scope === 'plugin') {
            if (!mdl.compiler.parent) throw new Error(`Dependency injection error. Module '${mdl.name}' has a dependency with name '${definition.name}' that has a 'plugin' scope but this module is not run within a plugin. Change the visibility of this dependency to 'module' or 'public' or add this module to a plugin`);

            if (!mdl.compiler.parent.hasOwn(definition.name)) {
                mdl.compiler.parent.add(definition);
            }
        } else if (definition.scope === 'public') {
            if (!mdl.compiler.root.hasOwn(definition.name)) {
                mdl.compiler.root.add(definition);
            }
        }

        const definitionObject = mdl.compiler.getDefinition(definition.name);

        if (definitionObject.hasCompilerPass()) {
            _execCompilerPass.call(mdl.compiler, mdl, definitionObject, config, _compileAddProxy(mdl, config));
        }
    }

    if (definition.shared) {
        const {modules, plugins} = definition.shared;

        if (modules) {
            for (const mdlName of modules) {
                if (mdlName === mdl.name) mdl.sharedCompiler.add(definition);
            }
        }

        if (plugins && mdl.isInPlugin()) {
            for (const pluginName of plugins) {
                if (pluginName === mdl.plugin.name) {
                    mdl.sharedCompiler.add(definition);
                }
            }
        }
    }
}

function _addDependencies(mdl, config) {
    const {dependencies} = mdl;

    for (const definition of dependencies) {
        _addDependency(mdl, definition, config);
    }
}

function _createCompiler(mdl, rootCompiler, parentCompiler, sharedCompiler, config) {
    const c = Compiler.create();
    c.name = 'module';
    c.root = rootCompiler;

    if (parentCompiler) c.parent = parentCompiler;

    mdl.compiler = c;
    mdl.sharedCompiler = sharedCompiler;

    if (mdl.dependencies && mdl.dependencies.length > 0) {
        _addDependencies(mdl, config);
    }
}

function _resolveMiddleware(mdl, config) {
    const middleware = MIDDLEWARE_TYPES.toArray();

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
        [MIDDLEWARE_TYPES.SECURITY]: mdl[MIDDLEWARE_TYPES.SECURITY],
        [MIDDLEWARE_TYPES.PRE_LOGIC_TRANSFORMERS]: mdl[MIDDLEWARE_TYPES.PRE_LOGIC_TRANSFORMERS],
        [MIDDLEWARE_TYPES.POST_LOGIC_TRANSFORMERS]: mdl[MIDDLEWARE_TYPES.POST_LOGIC_TRANSFORMERS],
        [MIDDLEWARE_TYPES.MODULE_LOGIC]: mdl[MIDDLEWARE_TYPES.MODULE_LOGIC],
        [MIDDLEWARE_TYPES.VALIDATORS]: mdl[MIDDLEWARE_TYPES.VALIDATORS],
        plugin: mdl.plugin,
        dependencies: mdl.dependencies,
        mediator: mdl.mediator,
        emitter: mdl.emitter,
        http: mdl.http,
        isHttp() {
            return !!mdl.http;
        },
        hasMediators() {
            return !!mdl.mediator;
        },
        hasEmitters() {
            return (mdl.emitter) ? true : false;
        },
        isInPlugin: () => !!(mdl.plugin),
    };
}

function _bindEventSystem(moduleObject, config, exposedMediator) {
    moduleObject.mediatorInstance = Mediator.create(moduleObject, config);
    moduleObject.emitterInstance = Emitter.create(moduleObject, config);
    moduleObject.exposedMediator = exposedMediator;

    if (moduleObject.hasMediators()) {
        const {mediator} = moduleObject;
        const keys = Object.keys(mediator);

        for (const event of keys) {
            if (moduleObject.exposedMediator.has(event) && !moduleObject.exposedMediator.isEmitted(event)) {
                moduleObject.exposedMediator.preBind(event, mediator[event]);
            }
        }
    }
}

/**
 * The dependency injection compiler has to be here. It does not have to be instantiated or created here but it has to be
 * here in order for module dependencies to be resolved.
 */
function factory({mdl, config, rootCompiler, parentCompiler, sharedCompiler, exposedMediator}) {
    const moduleObject = _createModuleModel(mdl, config);

    // after the _createCompiler() function has been called, nothing on the compiler cannot be touched or modified.
    // the compiler(s) can only be used, not modified
    _createCompiler(moduleObject, rootCompiler, parentCompiler, sharedCompiler, config);
    _resolveMiddleware(moduleObject, config);

    _bindEventSystem(moduleObject, config, exposedMediator);

    return moduleObject;
}

module.exports = function(buildStageArgs) {
    return new factory(buildStageArgs);
};