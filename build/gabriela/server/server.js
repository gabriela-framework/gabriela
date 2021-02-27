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
var GABRIELA_EVENTS = require('../misc/types').GABRIELA_EVENTS;
var _a = require('../events/util/gabrielaEventUtils'), callSingleGabrielaEvent = _a.callSingleGabrielaEvent, runOnAppStarted = _a.runOnAppStarted;
var ShutdownManager = require('./shutdownManager');
function _shutdown(server, events, rootCompiler, shutdownManager) {
    if (server) {
        shutdownManager.shutdown(function () {
            console.log('All connections closed. Server terminated.');
            if (events && events[GABRIELA_EVENTS.ON_EXIT])
                return callSingleGabrielaEvent.call(null, events[GABRIELA_EVENTS.ON_EXIT], rootCompiler);
        });
    }
}
function _addMiddleware(app, middleware) {
    for (var _i = 0, middleware_1 = middleware; _i < middleware_1.length; _i++) {
        var m = middleware_1[_i];
        app.use(m);
    }
}
function _createServer(config) {
    var express = require('express');
    var app = express();
    var _a = config.server, port = _a.port, host = _a.host;
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    return { app: app, port: port, host: host };
}
function _mountViewEngineIfExists(server, config) {
    var viewEngine = config.server.viewEngine;
    if (viewEngine.hasViewEngine) {
        server.app.set('views', viewEngine.views);
        server.app.set('view engine', viewEngine['view engine']);
        server.app.engine('jsx', viewEngine['engine']);
    }
}
function _runComponents(_a) {
    var moduleExecuteFactory = _a.moduleExecuteFactory, pluginExecuteFactory = _a.pluginExecuteFactory, pluginInterface = _a.pluginInterface, moduleInterface = _a.moduleInterface, server = _a.server;
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4, pluginInterface.run(pluginExecuteFactory.bind(null, moduleExecuteFactory, server))];
                case 1:
                    _b.sent();
                    return [4, moduleInterface.run(moduleExecuteFactory.bind(null, server))];
                case 2:
                    _b.sent();
                    return [2];
            }
        });
    });
}
function _listenCallback(config, events, rootCompiler) {
    return __awaiter(this, void 0, void 0, function () {
        var context, env, host, port;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context = {
                        gabriela: this
                    };
                    return [4, runOnAppStarted.call(context, events, rootCompiler)];
                case 1:
                    _a.sent();
                    env = config['framework']['env'];
                    host = config['server']['host'];
                    port = config['server']['port'];
                    require('./../logging/Logging').outputMemory("'App started in '" + env + "' environment and mounted as server on host '" + host + "' and port '" + port + "'. All modules and plugins ran.'");
                    return [2];
            }
        });
    });
}
function Server(config, events, rootCompiler, pluginInterface, moduleInterface) {
    var _this = this;
    var env = config['framework']['env'];
    var server = _createServer(config);
    _addMiddleware(server.app, config.server.expressMiddleware);
    _mountViewEngineIfExists(server, config);
    var serverInstance = null;
    var shutdownManager = null;
    function run(moduleExecuteFactory, pluginExecuteFactory) {
        var _this = this;
        var args = {
            moduleExecuteFactory: moduleExecuteFactory,
            pluginExecuteFactory: pluginExecuteFactory,
            pluginInterface: pluginInterface,
            moduleInterface: moduleInterface,
            server: server.app
        };
        _runComponents(args).then(function () {
            serverInstance = server.app.listen(server.port, server.host, _listenCallback.bind(_this, config, events, rootCompiler));
            shutdownManager = new ShutdownManager(serverInstance);
            shutdownManager.startWatching();
        })["catch"](function (err) {
            var context = {
                gabriela: _this
            };
            if (events && events[GABRIELA_EVENTS.ON_CATCH_ERROR])
                return callSingleGabrielaEvent.call(context, events[GABRIELA_EVENTS.ON_CATCH_ERROR], rootCompiler, err);
            console.error("Fatal error occurred. Since you haven't declared an catchError event, Gabriela has exited. The error message was: " + err.message);
            _this.close();
            throw err;
        });
    }
    if (env === 'prod') {
        process.on('SIGINT', function () {
            _this.close();
        });
        process.on('SIGTERM', function () {
            _this.close();
        });
    }
    function close() {
        _shutdown(serverInstance, events, rootCompiler, shutdownManager, env);
        serverInstance = null;
        server = null;
    }
    this.run = run;
    this.close = close;
}
module.exports = Server;
//# sourceMappingURL=server.js.map