var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var _a = require('../util/util'), getArgs = _a.getArgs, hasKey = _a.hasKey, is = _a.is;
var _callFn = require('./util/_callFn');
function _sendEvent(fn, moduleOrPlugin, config, customArgs) {
    new Promise(function (resolve) {
        var args = getArgs(fn);
        if (customArgs && is('object', customArgs)) {
            for (var name_1 in customArgs) {
                if (hasKey(customArgs, name_1)) {
                    for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
                        var arg = args_1[_i];
                        if (arg.name === name_1)
                            arg.value = customArgs[name_1];
                    }
                }
            }
            args = __spreadArray([], args);
        }
        _callFn(fn, moduleOrPlugin, args, config);
        resolve();
    });
}
function instance(moduleOrPlugin, config) {
    var subscribers = {};
    function emit(name, customArgs) {
        var fns = subscribers[name];
        for (var _i = 0, fns_1 = fns; _i < fns_1.length; _i++) {
            var fn = fns_1[_i];
            _sendEvent(fn, moduleOrPlugin, config, customArgs);
        }
    }
    function add(name, fn) {
        if (hasKey(subscribers, name))
            throw new Error("Invalid emitter event. Emitter with name '" + name + "' already exist");
        subscribers[name] = fn;
    }
    this.emit = emit;
    this.add = add;
}
function factory() {
    this.create = function (moduleOrPlugin, config) {
        return new instance(moduleOrPlugin, config);
    };
}
module.exports = new factory();
//# sourceMappingURL=emitter.js.map