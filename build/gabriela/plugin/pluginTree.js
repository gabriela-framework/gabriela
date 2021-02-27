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
var deepCopy = require('deepcopy');
var PluginRunner = require('./pluginRunner');
var pluginFactory = require('./pluginFactory');
var _a = require('../util/util'), is = _a.is, hasKey = _a.hasKey, IIterator = _a.IIterator;
function _createWorkingDataStructures() {
    var Plugins = (function (_super) {
        __extends(Plugins, _super);
        function Plugins() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Plugins;
    }(IIterator));
    var ConstructedPlugins = (function (_super) {
        __extends(ConstructedPlugins, _super);
        function ConstructedPlugins() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ConstructedPlugins;
    }(IIterator));
    return {
        plugins: new Plugins(),
        constructed: new ConstructedPlugins()
    };
}
function _runConstructedPlugin(pluginModel, config, executeFactory) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginRunner;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pluginRunner = PluginRunner.create(pluginModel);
                    return [4, pluginRunner.run(config, executeFactory)];
                case 1: return [2, _a.sent()];
            }
        });
    });
}
function instance(config, rootCompiler, sharedCompiler, exposedMediator) {
    var _a = _createWorkingDataStructures(), plugins = _a.plugins, constructed = _a.constructed;
    function addPlugin(plugin) {
        plugins[plugin.name] = deepCopy(plugin);
        constructed[plugin.name] = pluginFactory(plugins[plugin.name], config, rootCompiler, sharedCompiler, exposedMediator);
    }
    function hasPlugin(name) {
        return hasKey(plugins, name);
    }
    function getPlugin(name) {
        if (!hasPlugin(name))
            return undefined;
        return deepCopy(plugins[name]);
    }
    function getPlugins() {
        return deepCopy(plugins);
    }
    function removePlugin(name) {
        if (!is('string', name))
            throw new Error("Plugin tree error. Invalid module name. Module name must be a string");
        if (!this.hasPlugin(name))
            throw new Error("Plugin tree error. Plugin with name '" + name + "' does not exist");
        delete plugins[name];
        delete constructed[name];
        return false;
    }
    function runPlugin(name, executeFactory) {
        return __awaiter(this, void 0, void 0, function () {
            var pluginModel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!is('string', name))
                            throw new Error("Plugin tree runtime error. Invalid plugin name type. Plugin name must be a string");
                        if (!this.hasPlugin(name))
                            throw new Error("Plugin tree runtime error. Plugin with name '" + name + "' does not exist");
                        if (!name) return [3, 2];
                        pluginModel = constructed[name];
                        return [4, _runConstructedPlugin(pluginModel, config, executeFactory)];
                    case 1: return [2, _a.sent()];
                    case 2: return [2];
                }
            });
        });
    }
    function runTree(executeFactory) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, _i, keys_1, name_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keys = Object.keys(plugins);
                        _i = 0, keys_1 = keys;
                        _a.label = 1;
                    case 1:
                        if (!(_i < keys_1.length)) return [3, 4];
                        name_1 = keys_1[_i];
                        return [4, this.runPlugin(plugins[name_1].name, executeFactory)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3, 1];
                    case 4: return [2];
                }
            });
        });
    }
    this.addPlugin = addPlugin;
    this.hasPlugin = hasPlugin;
    this.getPlugin = getPlugin;
    this.getPlugins = getPlugins;
    this.removePlugin = removePlugin;
    this.runPlugin = runPlugin;
    this.runTree = runTree;
}
function factory(config, rootCompiler, sharedCompiler, exposedMediator) {
    return new instance(config, rootCompiler, sharedCompiler, exposedMediator);
}
module.exports = factory;
//# sourceMappingURL=pluginTree.js.map