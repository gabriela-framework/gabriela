var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var hasKey = require('../../util/util').hasKey;
var resolveDependencies = require('../../dependencyInjection/resolveDependencies');
module.exports = function _callFn(fn, moduleOrPlugin, args, config) {
    var resolvedArgs = args.map(function (arg) {
        if (arg.value)
            return arg.value;
        var dep = resolveDependencies(moduleOrPlugin.compiler, arg.name, config, moduleOrPlugin.name, (hasKey('plugin', moduleOrPlugin)) ? moduleOrPlugin.plugin : null);
        if (dep)
            return dep;
        if (!arg.value)
            throw new Error("Argument resolving error. Cannot resolve argument with name '" + arg.name + "'");
    });
    fn.call.apply(fn, __spreadArray([null], resolvedArgs));
};
//# sourceMappingURL=_callFn.js.map