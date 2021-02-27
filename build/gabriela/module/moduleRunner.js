var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var deepCopy = require('deepcopy');
var callEvent = require('../events/util/callEvent');
var is = require('../util/util').is;
var BUILT_IN_MEDIATORS = require('../misc/types').BUILT_IN_MEDIATORS;
function _assignMediatorEvents(mdl) {
    if (mdl.hasMediators()) {
        var mediators = mdl.mediator;
        var props = Object.keys(mediators);
        for (var _i = 0, props_1 = props; _i < props_1.length; _i++) {
            var name_1 = props_1[_i];
            mdl.mediatorInstance.add(name_1, mediators[name_1]);
        }
    }
}
function _assignEmitterEvents(mdl) {
    if (mdl.hasEmitters()) {
        var subscribers = mdl.emitter;
        var props = Object.keys(subscribers);
        for (var _i = 0, props_2 = props; _i < props_2.length; _i++) {
            var name_2 = props_2[_i];
            mdl.emitterInstance.add(name_2, subscribers[name_2]);
        }
    }
}
function _createContext(_a) {
    var mediator = _a.mediator, emitter = _a.emitter, moduleInfo = _a.moduleInfo, compiler = _a.compiler;
    return {
        mediator: mediator,
        emitter: emitter,
        moduleInfo: moduleInfo,
        compiler: compiler
    };
}
function _handleError(err, mdl) {
    if (err.internal) {
        if (err.message === 'done') {
            return;
        }
    }
    if (!mdl.hasMediators())
        throw err;
    if (mdl.hasMediators() && !mdl.mediator.onError)
        throw err;
    mdl.mediatorInstance.runOnError(mdl.mediator.onError, err);
}
function _emitImplementationFactory(mdl) {
    return function (name, customArgs, propagate) {
        if (propagate === void 0) { propagate = false; }
        if (!is('boolean', propagate))
            throw new Error("Invalid mediator event. Propagation argument for event '" + name + "' has to be a boolean");
        if (mdl.exposedMediator.has(name)) {
            return mdl.exposedMediator.emit(name, mdl.compiler.root, customArgs);
        }
        if (propagate) {
            if (mdl.mediatorInstance.has(name))
                mdl.mediatorInstance.emit(name, customArgs);
            if (mdl.isInPlugin() && mdl.plugin.mediatorInstance.has(name))
                return mdl.plugin.mediatorInstance.emit(name, customArgs);
            throw new Error("Invalid mediator event. Mediator with name '" + name + "' does not exist in module '" + mdl.name + "'");
        }
        if (mdl.mediatorInstance.has(name))
            return mdl.mediatorInstance.emit(name, customArgs);
        if (mdl.isInPlugin() && mdl.plugin.mediatorInstance.has(name))
            return mdl.plugin.mediatorInstance.emit(name, customArgs);
        throw new Error("Invalid mediator event. Mediator with name '" + name + "' does not exist in module '" + mdl.name + "'");
    };
}
function _createModuleInfo(mdl) {
    var moduleInfo = {};
    moduleInfo.moduleName = mdl.name;
    moduleInfo.modelName = mdl.modelName;
    moduleInfo.route = {
        matchedPath: mdl.getFullPath()
    };
    if (mdl.isInPlugin()) {
        moduleInfo.plugin = {
            name: mdl.plugin.name
        };
    }
    else {
        mdl.plugin = undefined;
    }
    return moduleInfo;
}
function _addCompilerProxy(mdl, config) {
    var handlers = {
        set: function () {
            throw new Error('Invalid compiler usage. Cannot set properties on the compiler when used within a middleware function.');
        },
        get: function (target, prop) {
            var allowed = ['get', 'has'];
            if (!allowed.includes(prop))
                throw new Error("Invalid compiler usage. Only 'Compiler::get(name: string): object' and 'Compiler::has(name: string): bool' are allowed to be used.");
            if (prop === 'has')
                return mdl.compiler.has;
            if (prop === 'get')
                return function (name) {
                    return mdl.compiler.compile.call(mdl.compiler, name, mdl.compiler, config);
                };
        }
    };
    return new Proxy(mdl.compiler, handlers);
}
function _createHttpContextFactory(mdl) {
    function run(config, executeFactory) {
        return __awaiter(this, void 0, void 0, function () {
            var context, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = _createContext({
                            mediator: {
                                emit: _emitImplementationFactory(mdl)
                            },
                            emitter: mdl.emitterInstance,
                            moduleInfo: _createModuleInfo(mdl),
                            compiler: _addCompilerProxy(mdl, config)
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        if (mdl.mediatorInstance.has(BUILT_IN_MEDIATORS.ON_MODULE_STARTED))
                            callEvent.call(mdl.mediatorInstance, mdl, BUILT_IN_MEDIATORS.ON_MODULE_STARTED);
                        return [4, executeFactory.call(null, mdl).call(null, mdl, context, config)];
                    case 2:
                        _a.sent();
                        if (mdl.mediatorInstance.has(BUILT_IN_MEDIATORS.ON_MODULE_FINISHED))
                            callEvent.call(mdl.mediatorInstance, mdl, BUILT_IN_MEDIATORS.ON_MODULE_FINISHED);
                        return [3, 4];
                    case 3:
                        err_1 = _a.sent();
                        _handleError(err_1, mdl);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    }
    function instance() {
        this.run = run;
    }
    return new instance();
}
function _createProcessContextFactory(mdl) {
    var state = {};
    function run(config, executeFactory) {
        return __awaiter(this, void 0, void 0, function () {
            var context, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = _createContext({
                            mediator: {
                                emit: _emitImplementationFactory(mdl)
                            },
                            emitter: mdl.emitterInstance,
                            moduleInfo: _createModuleInfo(mdl),
                            compiler: _addCompilerProxy(mdl, config)
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        if (mdl.mediatorInstance.has(BUILT_IN_MEDIATORS.ON_MODULE_STARTED))
                            callEvent.call(mdl.mediatorInstance, mdl, BUILT_IN_MEDIATORS.ON_MODULE_STARTED);
                        if (mdl.isHttp()) {
                            state = null;
                        }
                        return [4, executeFactory.call(null, mdl).call(null, mdl, context, config, state)];
                    case 2:
                        _a.sent();
                        if (mdl.mediatorInstance.has(BUILT_IN_MEDIATORS.ON_MODULE_FINISHED))
                            callEvent.call(mdl.mediatorInstance, mdl, BUILT_IN_MEDIATORS.ON_MODULE_FINISHED);
                        return [3, 4];
                    case 3:
                        err_2 = _a.sent();
                        _handleError(err_2, mdl);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    }
    function getResult() {
        var result = deepCopy(state);
        state = null;
        return result;
    }
    function instance() {
        this.run = run;
        this.getResult = getResult;
    }
    return new instance();
}
function factory() {
    function create(mdl) {
        _assignMediatorEvents(mdl);
        _assignEmitterEvents(mdl);
        if (mdl.isHttp()) {
            return _createHttpContextFactory(mdl);
        }
        else {
            return _createProcessContextFactory(mdl);
        }
    }
    this.create = create;
}
module.exports = new factory();
//# sourceMappingURL=moduleRunner.js.map