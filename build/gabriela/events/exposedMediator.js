var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var _a = require('../util/util'), hasKey = _a.hasKey, getArgs = _a.getArgs, is = _a.is;
function _callFn(fn, compiler, args) {
    var resolvedArgs = args.map(function (arg) {
        var dep;
        if (compiler.has(arg.name)) {
            dep = compiler.compile(arg.name, compiler);
        }
        if (dep)
            return dep;
        if (!arg.value)
            throw new Error("Argument resolving error. Cannot resolve argument with name '" + arg.name + "'");
        return arg.value;
    });
    fn.call.apply(fn, __spreadArray([null], resolvedArgs));
}
function _callEvent(fn, compiler, customArgs) {
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
    _callFn(fn, compiler, args);
}
function factory() {
    var definitions = {};
    function emit(name, compiler, customArgs) {
        if (!hasKey(definitions, name))
            throw new Error("Invalid exposed event. Exposed event with name '" + name + "' does not exist");
        if (!definitions[name]) {
            definitions[name] = {
                fns: [],
                compiler: compiler,
                args: customArgs,
                emitted: null
            };
        }
        if (!definitions[name].compiler) {
            definitions[name].compiler = compiler;
            definitions[name].args = customArgs;
        }
        definitions[name].emitted = true;
        if (definitions[name].fns) {
            for (var _i = 0, _a = definitions[name].fns; _i < _a.length; _i++) {
                var fn = _a[_i];
                _callEvent(fn, definitions[name].compiler, definitions[name].args);
            }
            if (!definitions[name].emitted)
                definitions[name].emitted = true;
        }
    }
    function isEmitted(name) {
        if (!definitions[name])
            return false;
        return definitions[name].emitted;
    }
    function preBind(name, fn) {
        if (definitions[name] && definitions[name].emitted === true)
            throw new Error("Internal Gabriela error. Invalid usage of exposed mediator instance. Exposed events must be first pre bound then emitted. It seems that event '" + name + "' has been emitted first and then bound. This should not happen");
        if (!is('function', fn))
            throw new Error("Invalid exposed event. '" + name + "' event has tried to pre bind something that is not a function");
        if (!definitions[name]) {
            definitions[name] = {
                fns: [],
                preBound: true,
                emitted: false
            };
            definitions[name].fns.push(fn);
            return;
        }
        definitions[name].fns.push(fn);
    }
    function add(name) {
        if (has(name))
            throw new Error("Invalid exposed event. Exposed event with name '" + name + "' already exists");
        definitions[name] = null;
    }
    function has(name) {
        return hasKey(definitions, name);
    }
    this.emit = emit;
    this.isEmitted = isEmitted;
    this.preBind = preBind;
    this.add = add;
    this.has = has;
}
module.exports = factory;
//# sourceMappingURL=exposedMediator.js.map