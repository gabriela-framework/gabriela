var Compiler = require('../dependencyInjection/compiler');
var Mediator = require('../events/mediator');
var Emitter = require('../events/emitter');
var _a = require('../util/util'), is = _a.is, hasKey = _a.hasKey;
var MIDDLEWARE_TYPES = require('../misc/types').MIDDLEWARE_TYPES;
var _addDependencies = require('./dependencyInjection/_addDependencies');
var Router = require('../router/router');
function _createCompiler(mdl, rootCompiler, parentCompiler, sharedCompiler, config) {
    var c = Compiler.create();
    c.name = 'module';
    c.root = rootCompiler;
    c.shared = sharedCompiler;
    if (parentCompiler)
        c.parent = parentCompiler;
    mdl.compiler = c;
    if (mdl.dependencies && mdl.dependencies.length > 0) {
        _addDependencies(mdl, config);
    }
}
function _resolveMiddleware(mdl) {
    var middleware = MIDDLEWARE_TYPES.toArray();
    for (var _i = 0, middleware_1 = middleware; _i < middleware_1.length; _i++) {
        var middlewareBlockName = middleware_1[_i];
        if (mdl[middlewareBlockName]) {
            var middlewareFns = mdl[middlewareBlockName];
            var newMiddlewareFns = [];
            for (var index in middlewareFns) {
                var n = middlewareFns[index];
                if (is('object', n)) {
                    if (hasKey(n, 'disabled') && n.disabled === true) {
                        continue;
                    }
                    newMiddlewareFns.push(n.middleware);
                }
                else if (is('string', n)) {
                    newMiddlewareFns.push(n);
                }
                else {
                    newMiddlewareFns.push(n);
                }
            }
            mdl[middlewareBlockName] = newMiddlewareFns;
        }
    }
}
function _resolveHttp(mdl) {
    if (!Router.has(mdl.route))
        return null;
    return Router.get(mdl.route);
}
function _createModuleModel(mdl) {
    var _a;
    return _a = {
            name: mdl.name
        },
        _a[MIDDLEWARE_TYPES.INIT] = mdl[MIDDLEWARE_TYPES.INIT],
        _a[MIDDLEWARE_TYPES.SECURITY] = mdl[MIDDLEWARE_TYPES.SECURITY],
        _a[MIDDLEWARE_TYPES.PRE_LOGIC_TRANSFORMERS] = mdl[MIDDLEWARE_TYPES.PRE_LOGIC_TRANSFORMERS],
        _a[MIDDLEWARE_TYPES.POST_LOGIC_TRANSFORMERS] = mdl[MIDDLEWARE_TYPES.POST_LOGIC_TRANSFORMERS],
        _a[MIDDLEWARE_TYPES.MODULE_LOGIC] = mdl[MIDDLEWARE_TYPES.MODULE_LOGIC],
        _a[MIDDLEWARE_TYPES.VALIDATORS] = mdl[MIDDLEWARE_TYPES.VALIDATORS],
        _a.plugin = mdl.plugin,
        _a.modelName = mdl.modelName,
        _a.dependencies = mdl.dependencies,
        _a.mediator = mdl.mediator,
        _a.emitter = mdl.emitter,
        _a.http = _resolveHttp(mdl),
        _a.isHttp = function () {
            return !!this.http;
        },
        _a.hasMediators = function () {
            return !!mdl.mediator;
        },
        _a.hasEmitters = function () {
            return (mdl.emitter) ? true : false;
        },
        _a.isInPlugin = function () { return !!(mdl.plugin); },
        _a.getFullPath = function () {
            if (!this.isHttp())
                return undefined;
            return this.http.path;
        },
        _a;
}
function _bindEventSystem(moduleObject, config, exposedMediator) {
    moduleObject.mediatorInstance = Mediator.create(moduleObject, config);
    moduleObject.emitterInstance = Emitter.create(moduleObject, config);
    moduleObject.exposedMediator = exposedMediator;
    if (moduleObject.hasMediators()) {
        var mediator = moduleObject.mediator;
        var keys = Object.keys(mediator);
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var event_1 = keys_1[_i];
            var isExposedEvent = false;
            if (moduleObject.exposedMediator.has(event_1) && !moduleObject.exposedMediator.isEmitted(event_1)) {
                moduleObject.exposedMediator.preBind(event_1, mediator[event_1]);
                isExposedEvent = true;
            }
        }
    }
}
function factory(_a) {
    var mdl = _a.mdl, config = _a.config, rootCompiler = _a.rootCompiler, parentCompiler = _a.parentCompiler, sharedCompiler = _a.sharedCompiler, exposedMediator = _a.exposedMediator;
    var moduleObject = _createModuleModel(mdl, config);
    _createCompiler(moduleObject, rootCompiler, parentCompiler, sharedCompiler, config);
    _resolveMiddleware(moduleObject);
    _bindEventSystem(moduleObject, config, exposedMediator);
    return moduleObject;
}
module.exports = function (buildStageArgs) {
    return new factory(buildStageArgs);
};
//# sourceMappingURL=moduleFactory.js.map