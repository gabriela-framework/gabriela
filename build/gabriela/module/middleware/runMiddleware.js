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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var taskRunnerFactory = require('../../misc/taskRunner');
var ASYNC_FLOW_TYPES = require('../../misc/types').ASYNC_FLOW_TYPES;
var _waitCheck = require('../../util/_waitCheck');
var resolveDependencies = require('../../dependencyInjection/resolveDependencies');
var parseExpression = require('../../expression/parse');
var TaskRunner = require('../../misc/taskRunner');
var _a = require('../../util/util'), createGenerator = _a.createGenerator, getArgs = _a.getArgs, wait = _a.wait, inArray = _a.inArray, is = _a.is, isAsyncFn = _a.isAsyncFn;
function _resolveFunctionExpression(fnString, mdl, config, state, http) {
    var parsed = parseExpression(fnString);
    var taskRunner = TaskRunner.create();
    if (!mdl.compiler.has(parsed.fnName))
        throw new Error("Expression dependency injection error. Dependency with name '" + parsed.fnName + "' not found in the dependency tree");
    var deps = [];
    for (var _i = 0, _a = parsed.dependencies; _i < _a.length; _i++) {
        var dep_1 = _a[_i];
        if (dep_1 === 'state') {
            deps.push({
                name: 'state',
                value: state
            });
        }
        else if (dep_1 === 'http') {
            deps.push({
                name: 'http',
                value: http
            });
        }
        else if (ASYNC_FLOW_TYPES.toArray().includes(dep_1)) {
            deps.push({
                name: dep_1,
                value: taskRunner[dep_1]
            });
        }
        else {
            deps.push({
                name: dep_1,
                value: resolveDependencies(mdl.compiler, dep_1, config, mdl.name, mdl.plugin)
            });
        }
    }
    var dep = resolveDependencies(mdl.compiler, parsed.fnName, config, mdl.name, mdl.plugin);
    return {
        fn: dep,
        args: deps,
        usedTaskRunner: taskRunner
    };
}
function syncExecFlow(exec, mdl, args, taskRunner, config) {
    return __awaiter(this, void 0, void 0, function () {
        var task;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    exec.call.apply(exec, __spreadArray([this], args.map(function (arg) {
                        if (arg.value)
                            return arg.value;
                        var dep = resolveDependencies(mdl.compiler, arg.name, config, mdl.name, mdl.plugin);
                        if (dep)
                            return dep;
                        if (!arg.value)
                            throw new Error("Argument resolving error. Cannot resolve argument with name '" + arg.name + "'");
                    })));
                    if (!!inArray(ASYNC_FLOW_TYPES.toArray(), args.map(function (arg) { return arg.name; }))) return [3, 1];
                    task = taskRunner.getTask();
                    return [3, 3];
                case 1: return [4, wait(_waitCheck.bind(null, taskRunner))];
                case 2:
                    task = _a.sent();
                    _a.label = 3;
                case 3: return [2, task];
            }
        });
    });
}
function asyncFlowExec(exec, mdl, args, taskRunner, config) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, exec.call.apply(exec, __spreadArray([this], args.map(function (arg) {
                        if (arg.name === 'next')
                            throw new Error("Invalid next() function in module '" + mdl.name + "'. When executing middleware with async keyword, next() is not necessary. Use await to get the same result.");
                        if (arg.name === 'throwException')
                            throw new Error("Invalid throwException() function in '" + mdl.name + "'. When executing middleware with async keyword, throwException() is not necessary. Use regular try/catch javascript mechanism.");
                        if (arg.value)
                            return arg.value;
                        var dep = resolveDependencies(mdl.compiler, arg.name, config, mdl.name, mdl.plugin);
                        if (dep)
                            return dep;
                        if (!arg.value)
                            throw new Error("Argument resolving error. Cannot resolve argument with name '" + arg.name + "'");
                    })))];
                case 1:
                    _a.sent();
                    return [2, taskRunner.getTask()];
            }
        });
    });
}
function recursiveMiddlewareExec(exec, taskRunner, mdl, state, config, http, generator) {
    return __awaiter(this, void 0, void 0, function () {
        var args, execObject, isAsyncMiddleware, task, error, error, next;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (is('string', exec)) {
                        execObject = _resolveFunctionExpression(exec, mdl, config, state, http);
                        exec = execObject.fn;
                        args = execObject.args;
                        taskRunner = execObject.usedTaskRunner;
                    }
                    isAsyncMiddleware = isAsyncFn(exec);
                    if (!args) {
                        args = getArgs(exec, {
                            next: taskRunner.next,
                            done: taskRunner.done,
                            skip: taskRunner.skip,
                            throwException: taskRunner.throwException,
                            state: state,
                            http: http
                        });
                    }
                    if (!!isAsyncMiddleware) return [3, 2];
                    return [4, syncExecFlow.call(this, exec, mdl, args, taskRunner, config)];
                case 1:
                    task = _a.sent();
                    return [3, 4];
                case 2:
                    if (!isAsyncMiddleware) return [3, 4];
                    return [4, asyncFlowExec.call(this, exec, mdl, args, taskRunner, config)];
                case 3:
                    task = _a.sent();
                    _a.label = 4;
                case 4:
                    switch (task) {
                        case 'skip': {
                            taskRunner.resolve();
                            return [2];
                        }
                        case 'done': {
                            taskRunner.resolve();
                            error = new Error('done');
                            error.internal = true;
                            throw error;
                        }
                        case 'error': {
                            error = taskRunner.getValue();
                            taskRunner.resolve();
                            throw error;
                        }
                    }
                    taskRunner.resolve();
                    next = generator.next();
                    if (next.done)
                        return [2];
                    return [4, recursiveMiddlewareExec.call(this, next.value, taskRunnerFactory.create(), mdl, state, config, http, generator)];
                case 5: return [2, _a.sent()];
            }
        });
    });
}
function runMiddleware(mdl, functions, config, state, http) {
    return __awaiter(this, void 0, void 0, function () {
        var generator, next;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(functions && functions.length > 0)) return [3, 2];
                    generator = createGenerator(functions);
                    next = generator.next();
                    return [4, recursiveMiddlewareExec.call(this, (!next.done) ? next.value : false, taskRunnerFactory.create(), mdl, state, config, http, generator)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2];
            }
        });
    });
}
module.exports = runMiddleware;
//# sourceMappingURL=runMiddleware.js.map