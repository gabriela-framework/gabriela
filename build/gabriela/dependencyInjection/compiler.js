var _a = require('../util/util'), getArgNames = _a.getArgNames, is = _a.is, hasKey = _a.hasKey;
var ASYNC_FLOW_TYPES = require('../misc/types').ASYNC_FLOW_TYPES;
var _b = require('./_permissions'), _hasCompletePermission = _b._hasCompletePermission, _hasModulePermission = _b._hasModulePermission, _hasPluginPermission = _b._hasPluginPermission, _isInPlugin = _b._isInPlugin;
var TaskRunner = require('../misc/taskRunner');
var InjectionTypeFactory = require('./injectionTypes/injectionType');
var _resolveService = require('./_resolveService');
var _createDefinitionObject = require('./_createDefinitionObject');
var _isInjectionTypeInterface = require('./injectionTypes/_isInjectionTypeInterface');
var _resolveInjectionService = require('./_resolveInjectionService');
var _resolveSharedDependency = require('./_resolveSharedDependency');
function _sharedDepsResolvingHelper(name, originCompiler, sharedInfo, config) {
    if (originCompiler.isResolved(name)) {
        var definition = this.shared.getOwnDefinition(name);
        if (_isInPlugin(sharedInfo) && _hasCompletePermission(name, definition, sharedInfo)) {
            return originCompiler.getResolved(name);
        }
        if (_isInPlugin(sharedInfo) && _hasPluginPermission(name, definition, sharedInfo)) {
            return originCompiler.getResolved(name);
        }
        if (_hasModulePermission(name, definition, sharedInfo)) {
            return originCompiler.getResolved(name);
        }
        if (sharedInfo.pluginName) {
            throw new Error("Dependency injection error. '" + name + "' service cannot be shared with module '" + sharedInfo.moduleName + "' that is a member of '" + sharedInfo.pluginName + "' plugin");
        }
        else {
            throw new Error("Dependency injection error. '" + name + "' service cannot be shared with module '" + sharedInfo.moduleName + "'");
        }
    }
    var service = _resolveSharedDependency(name, originCompiler, sharedInfo, config);
    if (!service) {
        if (sharedInfo.pluginName) {
            throw new Error("Dependency injection error. '" + name + "' service cannot be shared with module '" + sharedInfo.moduleName + "' that is a member of '" + sharedInfo.pluginName + "' plugin");
        }
        else {
            throw new Error("Dependency injection error. '" + name + "' service cannot be shared with module '" + sharedInfo.moduleName + "'");
        }
    }
    return service;
}
function _getDependencies(name, definition, taskRunner, originalCompiler, config, sharedInfo) {
    var args = getArgNames(definition.init);
    if (definition.isAsync) {
        if (!args.includes('next') && !args.includes('throwException')) {
            throw new Error("Dependency injection error. Invalid service init for dependency with name '" + name + "'. If a dependency is marked as asynchronous with 'isAsync' option, it has to include 'next' function in the argument list and call it when service construction is ready");
        }
    }
    var deps = [];
    if (args.length > 0) {
        for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
            var arg = args_1[_i];
            if (ASYNC_FLOW_TYPES.toArray().includes(arg)) {
                deps.push(taskRunner[arg]);
            }
            else {
                deps.push(originalCompiler.compile(arg, originalCompiler, config, sharedInfo));
            }
        }
    }
    return {
        names: args,
        services: deps
    };
}
function _createMetadata(service, serviceName, argNames, definition) {
    var metadata = {};
    metadata.name = serviceName;
    metadata.args = argNames;
    if (is('object', definition.shared)) {
        metadata.scope = {
            type: 'shared',
            modules: (!definition.shared.modules) ? [] : definition.shared.modules,
            plugins: (!definition.shared.plugins) ? [] : definition.shared.plugins
        };
        return metadata;
    }
    var scope;
    if (definition.scope) {
        scope = definition.scope;
    }
    else {
        scope = 'module';
    }
    metadata.scope = {
        type: 'visibility',
        scope: scope
    };
    return metadata;
}
function factory() {
    this.root = null;
    this.parent = null;
    this.name = null;
    var selfTree = {};
    var resolved = {};
    var injectionType = new InjectionTypeFactory();
    function add(definition) {
        selfTree[definition.name] = _createDefinitionObject(definition);
    }
    function getOwnDefinition(name) {
        if (!this.hasOwn(name))
            throw new Error("Dependency injection error. Definition object with name '" + name + "' not found");
        return selfTree[name];
    }
    function getDefinition(name) {
        if (this.hasOwn(name))
            return this.getOwnDefinition(name);
        if (this.parent) {
            if (this.parent.hasOwn(name))
                return this.parent.getOwnDefinition(name);
        }
        if (this.root) {
            if (this.root.hasOwn(name))
                return this.root.getOwnDefinition(name);
        }
        throw new Error("Dependency injection error. Definition object with name '" + name + "' not found");
    }
    function getResolved(name) {
        if (resolved[name])
            return resolved[name];
        var parentResolved = null;
        var rootResolved = null;
        var sharedResolved = null;
        if (this.parent) {
            parentResolved = this.parent.getResolved(name);
        }
        if (this.root) {
            rootResolved = this.root.getResolved(name);
        }
        if (this.shared) {
            sharedResolved = this.shared.getResolved(name);
        }
        if (parentResolved)
            return parentResolved;
        if (rootResolved)
            return rootResolved;
        if (sharedResolved)
            return sharedResolved;
    }
    function hasOwn(name) {
        return hasKey(selfTree, name);
    }
    function has(name) {
        if (hasKey(selfTree, name))
            return true;
        if (this.parent && this.parent.has(name))
            return true;
        if (this.root && this.root.has(name))
            return true;
        if (this.shared && this.shared.has(name))
            return true;
        return false;
    }
    function isResolved(name) {
        if (hasKey(resolved, name))
            return true;
        if (this.parent && this.parent.isResolved(name))
            return true;
        if (this.root && this.root.isResolved(name))
            return true;
        if (this.shared && this.shared.isResolved(name))
            return true;
        return false;
    }
    function compile(name, originCompiler, config, sharedInfo) {
        if (!is('string', name))
            throw new Error("Dependency injection error. 'compile' method expect a string as a name of a dependency that you want to compile");
        if (hasKey(resolved, name))
            return resolved[name];
        var definition;
        if (hasKey(selfTree, name)) {
            definition = selfTree[name];
        }
        else if (this.parent && this.parent.has(name)) {
            return this.parent.compile(name, originCompiler, config, sharedInfo);
        }
        else if (this.root && this.root.has(name)) {
            return this.root.compile(name, originCompiler, config, sharedInfo);
        }
        else if (this.shared && this.shared.has(name)) {
            return _sharedDepsResolvingHelper.call(this, name, originCompiler, sharedInfo, config);
        }
        if (!definition)
            throw new Error("Dependency injection error. '" + name + "' definition not found in the dependency tree");
        var taskRunner = TaskRunner.create();
        var deps = _getDependencies.call(this, name, definition, taskRunner, originCompiler, config, sharedInfo);
        var serviceMetadata = _resolveService(definition, deps.services, taskRunner, injectionType);
        if (serviceMetadata.isError) {
            throw serviceMetadata.error;
        }
        if (_isInjectionTypeInterface(serviceMetadata)) {
            return _resolveInjectionService(originCompiler, sharedInfo, serviceMetadata, taskRunner, config);
        }
        var service = serviceMetadata.service;
        if (!service)
            throw new Error("Dependency injection error. Target service " + name + " cannot return a falsy value");
        service._$metadata = _createMetadata(service, name, deps.names, definition);
        if (definition.cache === false) {
            return service;
        }
        resolved[name] = service;
        return resolved[name];
    }
    this.add = add;
    this.has = has;
    this.hasOwn = hasOwn;
    this.isResolved = isResolved;
    this.getOwnDefinition = getOwnDefinition;
    this.getDefinition = getDefinition;
    this.getResolved = getResolved;
    this.compile = compile;
}
function instance() {
    this.create = function () {
        return new factory();
    };
}
module.exports = new instance();
//# sourceMappingURL=compiler.js.map