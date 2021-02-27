var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var ModuleRunner = require('./moduleRunner');
var Validator = require('../misc/validator');
var moduleFactory = require('./moduleFactory');
var deepCopy = require('deepcopy');
var _a = require('../util/util'), hasKey = _a.hasKey, is = _a.is, IIterator = _a.IIterator;
var _overrideMiddleware = require('./middlewareOverriding/overrideMiddleware');
var Router = require('../router/router');
function _runConstructedModule(mdl, config, executeFactory) {
    return __awaiter(this, void 0, void 0, function () {
        var runner;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    runner = ModuleRunner.create(deepCopy(mdl));
                    return [4, runner.run(config, executeFactory)];
                case 1:
                    _a.sent();
                    if (mdl.isHttp()) {
                        return [2, '$$gabriela_discard_result'];
                    }
                    return [2, runner.getResult()];
            }
        });
    });
}
function _createWorkingDataStructures() {
    var Modules = (function (_super) {
        __extends(Modules, _super);
        function Modules() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Modules;
    }(IIterator));
    var ConstructedModules = (function (_super) {
        __extends(ConstructedModules, _super);
        function ConstructedModules() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ConstructedModules;
    }(IIterator));
    return {
        modules: new Modules(),
        constructed: new ConstructedModules()
    };
}
function instance(config, rootCompiler, sharedCompiler, exposedMediator) {
    var _this = this;
    var _a = _createWorkingDataStructures(), modules = _a.modules, constructed = _a.constructed;
    function addModule(mdl, parentCompiler) {
        modules[mdl.name] = deepCopy(mdl);
        var buildStageArgs = {
            mdl: modules[mdl.name],
            config: config,
            rootCompiler: rootCompiler,
            parentCompiler: parentCompiler,
            sharedCompiler: sharedCompiler,
            exposedMediator: exposedMediator
        };
        constructed[mdl.name] = moduleFactory(buildStageArgs);
    }
    function runModule(name, executeFactory) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!is('string', name))
                            throw new Error("Module runtime tree error. Invalid module name type. Module name must be a string");
                        if (!this.hasModule(name))
                            throw new Error("Module runtime tree error. Module with name '" + name + "' does not exist");
                        return [4, _runConstructedModule(constructed[name], config, executeFactory)];
                    case 1:
                        res = _a.sent();
                        if (constructed[name].isHttp()) {
                            delete constructed[name];
                        }
                        if (res !== '$$gabriela_discard_result') {
                            return [2, deepCopy(res)];
                        }
                        return [2, res];
                }
            });
        });
    }
    function runTree(executeFactory) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, state, _i, keys_1, name_1, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keys = Object.keys(modules);
                        state = {};
                        _i = 0, keys_1 = keys;
                        _a.label = 1;
                    case 1:
                        if (!(_i < keys_1.length)) return [3, 4];
                        name_1 = keys_1[_i];
                        return [4, this.runModule(modules[name_1].name, executeFactory)];
                    case 2:
                        res = _a.sent();
                        if (res !== '$$gabriela_discard_result') {
                            state[modules[name_1].name] = res;
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3, 1];
                    case 4: return [2, deepCopy(state)];
                }
            });
        });
    }
    function overrideModule(mdl, parentCompiler) {
        Validator.validateModule(mdl, Router);
        if (!this.hasModule(mdl.name)) {
            throw new Error("Module overriding error. Module with name '" + mdl.name + "' does not exist");
        }
        var existing = this.getModule(mdl.name);
        _overrideMiddleware(mdl, existing);
        modules[mdl.name] = deepCopy(existing);
        var buildStageArgs = {
            mdl: modules[mdl.name],
            config: config,
            rootCompiler: rootCompiler,
            parentCompiler: parentCompiler,
            sharedCompiler: sharedCompiler,
            exposedMediator: exposedMediator
        };
        constructed[mdl.name] = moduleFactory(buildStageArgs);
    }
    function removeModule(name) {
        if (!this.hasModule(name))
            return false;
        delete constructed[name];
        delete modules[name];
        return true;
    }
    this.parent = null;
    this.addModule = addModule;
    this.overrideModule = overrideModule;
    this.hasModule = function (name) { return hasKey(modules, name); };
    this.getModule = function (name) { return (_this.hasModule(name)) ? deepCopy(modules[name]) : undefined; };
    this.getModules = function () { return deepCopy(modules); };
    this.removeModule = removeModule;
    this.runModule = runModule;
    this.runTree = runTree;
}
function factory(config, rootCompiler, sharedCompiler, exposedMediator) {
    return new instance(config, rootCompiler, sharedCompiler, exposedMediator);
}
module.exports = factory;
//# sourceMappingURL=moduleTree.js.map