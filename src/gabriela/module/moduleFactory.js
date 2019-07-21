const Compiler = require('../dependencyInjection/compiler');
const parseExpression = require('../expression/parse');
const Mediator = require('../events/mediator');
const Emitter = require('../events/emitter');
const {is, hasKey} = require('../util/util');
const {MIDDLEWARE_TYPES} = require('../misc/types');
const _addDependencies = require('./dependencyInjection/_addDependencies');

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