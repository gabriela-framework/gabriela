var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var deepCopy = require('deepcopy');
var Validator = require('../../misc/validator');
var hasKey = require('../../util/util').hasKey;
function _addDependencies(mdl, config) {
    var dependencies = mdl.dependencies;
    for (var _i = 0, dependencies_1 = dependencies; _i < dependencies_1.length; _i++) {
        var definition = dependencies_1[_i];
        _addDependency(mdl, definition, config);
    }
}
function _compileAddProxy(mdl, config) {
    return function (definition) {
        Validator.validateDefinitionObject(definition);
        _addDependency(mdl, definition, config);
    };
}
function _execCompilerPass(mdl, definition, config, addProxy) {
    var _a;
    var compilerPass = definition.compilerPass;
    var handlers = {
        set: function () { return undefined; },
        get: function (target, prop) {
            if (prop === 'compile')
                throw new Error("Dependency injection error in service '" + definition.name + "'. Compiling inside a compiler pass is forbidden");
            if (prop === 'add')
                return addProxy;
            return target[prop];
        }
    };
    var possibleConfig = config;
    if (compilerPass.property) {
        if (!hasKey(config.plugins, compilerPass.property))
            throw new Error("Dependency injection error in a compiler pass in service '" + definition.name + "'. Property '" + compilerPass.property + "' does not exist in config");
        possibleConfig = config.plugins[compilerPass.property];
    }
    (_a = compilerPass.init).call.apply(_a, __spreadArray([null], [deepCopy(possibleConfig), new Proxy(this, handlers)]));
}
function _addDependency(mdl, definition, config) {
    if (!definition.scope && !definition.shared)
        definition.scope = 'module';
    if (definition.scope) {
        if (definition.scope === 'module') {
            if (!mdl.compiler.hasOwn(definition.name)) {
                mdl.compiler.add(definition);
            }
        }
        else if (definition.scope === 'plugin') {
            if (!mdl.compiler.parent)
                throw new Error("Dependency injection error. Module '" + mdl.name + "' has a dependency with name '" + definition.name + "' that has a 'plugin' scope but this module is not run within a plugin. Change the visibility of this dependency to 'module' or 'public' or add this module to a plugin");
            if (!mdl.compiler.parent.hasOwn(definition.name)) {
                mdl.compiler.parent.add(definition);
            }
        }
        else if (definition.scope === 'public') {
            if (!mdl.compiler.root.hasOwn(definition.name)) {
                mdl.compiler.root.add(definition);
            }
        }
        var definitionObject = mdl.compiler.getDefinition(definition.name);
        if (definitionObject.hasCompilerPass()) {
            _execCompilerPass.call(mdl.compiler, mdl, definitionObject, config, _compileAddProxy(mdl, config));
        }
    }
    if (definition.shared) {
        var _a = definition.shared, modules = _a.modules, plugins = _a.plugins;
        if (modules) {
            for (var _i = 0, modules_1 = modules; _i < modules_1.length; _i++) {
                var mdlName = modules_1[_i];
                if (!mdl.compiler.has(definition.name)) {
                    mdl.compiler.shared.add(definition);
                }
            }
        }
        if (plugins) {
            for (var _b = 0, plugins_1 = plugins; _b < plugins_1.length; _b++) {
                var pluginName = plugins_1[_b];
                if (!mdl.compiler.has(definition.name)) {
                    mdl.compiler.shared.add(definition);
                }
            }
        }
    }
}
module.exports = _addDependencies;
//# sourceMappingURL=_addDependencies.js.map