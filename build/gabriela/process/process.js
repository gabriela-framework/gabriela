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
var pluginExecuteFactory = require('../plugin/executeFactory');
var moduleExecuteFactory = require('../module/executeFactory');
var _a = require('../events/util/gabrielaEventUtils'), runOnAppStarted = _a.runOnAppStarted, callSingleGabrielaEvent = _a.callSingleGabrielaEvent;
function runApp(config, events, rootCompiler, pluginInterface, moduleInterface) {
    return __awaiter(this, void 0, void 0, function () {
        var context, env, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    context = {
                        gabriela: this
                    };
                    return [4, pluginInterface.run(pluginExecuteFactory.bind(null, moduleExecuteFactory, null))];
                case 1:
                    _a.sent();
                    return [4, moduleInterface.run(moduleExecuteFactory.bind(null, null))];
                case 2:
                    _a.sent();
                    return [4, runOnAppStarted.call(context, events, rootCompiler)];
                case 3:
                    _a.sent();
                    if (events && events[GABRIELA_EVENTS.ON_EXIT])
                        return [2, callSingleGabrielaEvent.call(null, events[GABRIELA_EVENTS.ON_EXIT], rootCompiler)];
                    env = config['framework']['env'];
                    require('./../logging/Logging').outputMemory("'App started in '" + env + "' environment and mounted as process. All modules and plugins ran.'");
                    return [3, 5];
                case 4:
                    err_1 = _a.sent();
                    if (events && events[GABRIELA_EVENTS.ON_CATCH_ERROR]) {
                        return [2, callSingleGabrielaEvent.call(this, events[GABRIELA_EVENTS.ON_CATCH_ERROR], rootCompiler, err_1)];
                    }
                    console.log("Fatal error occurred. Since you haven't declared an catchError event, Gabriela has exited. The error message was: " + err_1.message);
                    if (events && events[GABRIELA_EVENTS.ON_EXIT])
                        return [2, callSingleGabrielaEvent.call(null, events[GABRIELA_EVENTS.ON_EXIT], rootCompiler)];
                    this.close();
                    return [3, 5];
                case 5: return [2];
            }
        });
    });
}
function factory(config, events, rootCompiler, pluginInterface, moduleInterface) {
    function run() {
        return runApp.call(this, config, events, rootCompiler, pluginInterface, moduleInterface);
    }
    function close() {
        process.on('SIGTERM', function () {
            if (events && events[GABRIELA_EVENTS.ON_EXIT])
                return callSingleGabrielaEvent.call(null, events[GABRIELA_EVENTS.ON_EXIT], rootCompiler);
        });
        console.log("Process has exited");
        process.kill(process.pid, 'SIGTERM');
    }
    this.close = close;
    this.run = run;
}
module.exports = factory;
//# sourceMappingURL=process.js.map