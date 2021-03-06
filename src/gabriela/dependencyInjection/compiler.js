const {getArgNames, is, hasKey} = require('../util/util');
const {
    ASYNC_FLOW_TYPES,
} = require('../misc/types');
const {
    _hasCompletePermission,
    _hasModulePermission,
    _hasPluginPermission,
    _isInPlugin
} = require('./_permissions');

const TaskRunner = require('../misc/taskRunner');
const InjectionTypeFactory = require('./injectionTypes/injectionType');

const _resolveService = require('./_resolveService');
const _createDefinitionObject = require('./_createDefinitionObject');
const _isInjectionTypeInterface = require('./injectionTypes/_isInjectionTypeInterface');
const _resolveInjectionService = require('./_resolveInjectionService');
const _resolveSharedDependency = require('./_resolveSharedDependency');

function _sharedDepsResolvingHelper(name, originCompiler, sharedInfo, config) {
    if (originCompiler.isResolved(name)) {
        const definition = this.shared.getOwnDefinition(name);
        if (_isInPlugin(sharedInfo) && _hasCompletePermission(name, definition, sharedInfo)) {
            return originCompiler.getResolved(name);
        }

        // if it is shared with a module that is in a plugin with name mdl.plugin.name
        if (_isInPlugin(sharedInfo) && _hasPluginPermission(name, definition, sharedInfo)) {
            return originCompiler.getResolved(name);
        }

        // if it is shared with a module name
        if (_hasModulePermission(name, definition, sharedInfo)) {
            return originCompiler.getResolved(name);
        }

        if (sharedInfo.pluginName) {
            throw new Error(`Dependency injection error. '${name}' service cannot be shared with module '${sharedInfo.moduleName}' that is a member of '${sharedInfo.pluginName}' plugin`);
        } else {
            throw new Error(`Dependency injection error. '${name}' service cannot be shared with module '${sharedInfo.moduleName}'`);
        }
    }

    const service = _resolveSharedDependency(name, originCompiler, sharedInfo, config);

    if (!service) {
        if (sharedInfo.pluginName) {
            throw new Error(`Dependency injection error. '${name}' service cannot be shared with module '${sharedInfo.moduleName}' that is a member of '${sharedInfo.pluginName}' plugin`);
        } else {
            throw new Error(`Dependency injection error. '${name}' service cannot be shared with module '${sharedInfo.moduleName}'`);
        }
    }

    return service;
}

function _getDependencies(name, definition, taskRunner, originalCompiler, config, sharedInfo) {
    const args = getArgNames(definition.init);

    if (definition.isAsync) {
        if (!args.includes('next') && !args.includes('throwException')) {
            throw new Error(`Dependency injection error. Invalid service init for dependency with name '${name}'. If a dependency is marked as asynchronous with 'isAsync' option, it has to include 'next' function in the argument list and call it when service construction is ready`);
        }
    }

    const deps = [];
    if (args.length > 0) {
        for (const arg of args) {
            if (ASYNC_FLOW_TYPES.toArray().includes(arg)) {
                deps.push(taskRunner[arg]);
            } else {
                deps.push(originalCompiler.compile(arg, originalCompiler, config, sharedInfo));
            }
        }
    }

    return {
        names: args,
        services: deps,
    }
}

function _createMetadata(service, serviceName, argNames, definition) {
    const metadata = {};
    metadata.name = serviceName;
    metadata.args = argNames;

    if (is('object', definition.shared)) {
        metadata.scope = {
            type: 'shared',
            modules: (!definition.shared.modules) ? [] : definition.shared.modules,
            plugins: (!definition.shared.plugins) ? [] : definition.shared.plugins,
        };

        return metadata;
    }

    let scope;
    if (definition.scope) {
        scope = definition.scope;
    } else {
        scope = 'module';
    }

    metadata.scope = {
        type: 'visibility',
        scope: scope,
    };

    return metadata;
}

/**
 * A compiler is a reusable object that resolved dependencies added as dependency definition objects.
 * A compiler can have scopes just as the javascript language has them. Just like in javascript, compiler
 * tries to resolve a dependency in its own scope (the current compiler instance). If it cannot find it,
 * it tries its own parent compiler (parent and root are also instances of this compiler). If it does not have
 * a parent, it tries to resolve it on the root. If it cannot find it either on the parent or the root, it throws
 * an exception.
 *
 * It is the implementors choice how to use this compiler. Gabriela uses it with 3 scopes: public, plugin and module scope.
 * The search for a dependency always begins on the module scope and bubbles up to the root scope. In gabriela, there can
 * only be a maximum of 3 scopes but this instance can be used in any other way, with parent having its own parents etc...
 */
function factory() {
    /**
     * The root compiler. There can be only one root compiler in gabriela
     * @type {null}
     */
    this.root = null;
    /**
     * Parent compiler. Parent compiler in gabriela is the plugin compiler that holds plugin scope dependencies
     * @type {null}
     */
    this.parent = null;
    this.name = null;

    /**
     * Holds non resolved dependencies
     * @type {{}}
     */
    const selfTree = {};
    /**
     * Holds resolved dependencies. The dependency is saved after its first instantiation and saved here. After its,
     * first usage, this variable is queries for subsequent request and not selfTree.
     * @type {{}}
     */
    const resolved = {};

    const injectionType = new InjectionTypeFactory();

    function add(definition) {
        selfTree[definition.name] = _createDefinitionObject(definition);
    }

    /**
     * Gets the definition from the selfTree. There is not information from this method call to know that
     * a definition has been resolved
     * @param name
     * @returns {*}
     */
    function getOwnDefinition(name) {
        if (!this.hasOwn(name)) throw new Error(`Dependency injection error. Definition object with name '${name}' not found`);

        return selfTree[name];
    }

    /**
     * Cannot use recursive calls to getDefinition() because I don't know where the definition is and if the
     * definition actually exists (and on which compiler does it exist).
     *
     * Also, possibly shit code. getOwnDefinition() throws an exception if the definition does not exist so
     * the 'if' checks are redundant but need to be done in order to return the first found definition.
     */
    function getDefinition(name) {
        if (this.hasOwn(name)) return this.getOwnDefinition(name);

        if (this.parent) {
            if (this.parent.hasOwn(name)) return this.parent.getOwnDefinition(name);
        }

        if (this.root) {
            if (this.root.hasOwn(name)) return this.root.getOwnDefinition(name);
        }

        throw new Error(`Dependency injection error. Definition object with name '${name}' not found`);
    }

    function getResolved(name) {
        if (resolved[name]) return resolved[name];

        let parentResolved = null;
        let rootResolved = null;
        let sharedResolved = null;


        if (this.parent) {
            parentResolved = this.parent.getResolved(name);
        }

        if (this.root) {
            rootResolved = this.root.getResolved(name);
        }

        if (this.shared) {
            sharedResolved = this.shared.getResolved(name);
        }

        if (parentResolved) return parentResolved;
        if (rootResolved) return rootResolved;
        if (sharedResolved) return sharedResolved;
    }

    /**
     * Only works on its own tree. Does not check parent or root
     * @param name
     * @returns {boolean|*}
     */
    function hasOwn(name) {
        return hasKey(selfTree, name);
    }

    /**
     * Recursively tries to find a dependency in all scopes. Checks both parent and root
     * @param name
     * @returns {boolean}
     */
    function has(name) {
        if (hasKey(selfTree, name)) return true;
        if (this.parent && this.parent.has(name)) return true;
        if (this.root && this.root.has(name)) return true;
        if (this.shared && this.shared.has(name)) return true;

        return false;
    }
    /**
     * Checks if the service is resolved on parent, root and self
     * @param name
     * @returns {boolean}
     */
    function isResolved(name) {
        if (hasKey(resolved, name)) return true;
        if (this.parent && this.parent.isResolved(name)) return true;
        if (this.root && this.root.isResolved(name)) return true;
        if (this.shared && this.shared.isResolved(name)) return true;

        return false;
    }

    /**
     * Compiles the service in parent, root and self scope if possible. originCompiler is the compiler that has
     * started the compilation. This is needed because if a service has a dependency, that dependency has to go trough
     * the process of resolving a service from the starting compiler.
     *
     * config argument is for the future and its use is not yet decided
     */
    function compile(
        name,
        originCompiler,
        config,
        sharedInfo,
    ) {
        if (!is('string', name)) throw new Error(`Dependency injection error. 'compile' method expect a string as a name of a dependency that you want to compile`);
        if (hasKey(resolved, name)) return resolved[name];

        let definition;

        if (hasKey(selfTree, name)) {
            definition = selfTree[name];
        } else if (this.parent && this.parent.has(name)) {
            return this.parent.compile(name, originCompiler, config, sharedInfo);
        } else if (this.root && this.root.has(name)) {
            return this.root.compile(name, originCompiler, config, sharedInfo);
        } else if (this.shared && this.shared.has(name)) {
            return _sharedDepsResolvingHelper.call(this, name, originCompiler, sharedInfo, config);
        }

        if (!definition) throw new Error(`Dependency injection error. '${name}' definition not found in the dependency tree`);

        const taskRunner = TaskRunner.create();

        const deps = _getDependencies.call(this, name, definition, taskRunner, originCompiler, config, sharedInfo);
        const serviceMetadata = _resolveService(definition, deps.services, taskRunner, injectionType);

        if (serviceMetadata.isError) {
            throw serviceMetadata.error;
        }

        if (_isInjectionTypeInterface(serviceMetadata)) {
            return _resolveInjectionService(originCompiler, sharedInfo, serviceMetadata, taskRunner, config);
        }

        const service = serviceMetadata.service;

        if (!service) throw new Error(`Dependency injection error. Target service ${name} cannot return a falsy value`);

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
    this.create = function() {
        return new factory();
    };
}

module.exports = new instance();
