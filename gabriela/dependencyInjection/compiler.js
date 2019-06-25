const deepCopy = require('deepcopy');

const getArgNames = require('../util/getArgNames');
const is = require('../util/is');
const TaskRunner = require('../misc/taskRunner');
const PrivateCompiler = require('./privateCompiler');

const _resolveService = require('./_resolveService');
const _createDefinitionObject = require('./_createDefinitionObject');

function _getDependencies(name, definition, taskRunner, originalCompiler, config) {
    const args = getArgNames(definition.init);

    if (definition.isAsync && !args.includes('next')) throw new Error(`Dependency injection error. Invalid service init for dependency with name '${name}'. If a dependency is marked as asynchronous with 'isAsync' option, it has to include 'next' function in the argument list and call it when service construction is ready`);

    const deps = [];
    if (args.length > 0) {
        for (let arg of args) {
            if (arg === 'next') {
                deps.push(taskRunner.next);
            } else {
                deps.push(originalCompiler.compile(arg, originalCompiler, config));
            }
        }
    }

    return deps;
}

function _execCompilerPass(definition, config) {
    const compilerPass = definition.compilerPass;

    const handlers = {
        set(obj, prop, value) { return undefined },
        get(target, prop, receiver) {
            if (prop === 'compile') throw new Error(`Dependency injection error in service '${definition.name}'. Compiling inside a compiler pass is forbidden`);

            return target[prop];
        }
    };

    let possibleConfig = config;
    if (compilerPass.property) {
        if (!possibleConfig.hasOwnProperty(compilerPass.property)) throw new Error(`Dependency injection error in a compiler pass in service '${definition.name}'. Property '${compilerPass.property}' does not exist in config`);

        possibleConfig = config[compilerPass.property];
    }

    compilerPass.init.call(null, ...[deepCopy(possibleConfig), new Proxy(this, handlers)]);
};

function factory() {
    this.root = null;
    this.parent = null;
    this.name = null;

    const selfTree = {};
    const resolved = {};

    function add(definition) {
        selfTree[definition.name] = _createDefinitionObject(definition);
    }

    function getOwnDefinition(name) {
        if (!this.has(name)) throw new Error(`Dependency injection error. Definition object with name '${name}' not found`);

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
        try {
            let definition = this.getOwnDefinition(name);
            if (definition) return definition;

            if (this.parent) {
                definition = this.parent.getOwnDefinition(name);

                if (definition) return definition;
            }

            if (this.root) {
                definition = this.root.getOwnDefinition(name);

                if (definition) return definition;
            }

            throw new Error(`Dependency injection error. Definition object with name '${name}' not found`);

        } catch (e) {
            throw new Error(e.message);
        }
    }

    function hasOwn(name) {
        return selfTree.hasOwnProperty(name);
    }

    function has(name) {
        if (selfTree.hasOwnProperty(name)) return true;
        if (this.parent && this.parent.has(name)) return true;
        if (this.root && this.root.has(name)) return true;

        return false;
    }

    function isResolved(name) {
        if (resolved.hasOwnProperty(name)) return true;
        if (this.parent && this.parent.isResolved(name)) return true;
        if (this.root && this.root.isResolved(name)) return true;

        return false;
    }

    function compile(name, originCompiler, config) {
        if (!is('string', name)) throw new Error(`Dependency injection error. 'compile' method expect a string as a name of a dependency that you want to compile`);
        if (resolved.hasOwnProperty(name)) return resolved[name];

        let definition;

        if (selfTree.hasOwnProperty(name)) {
            definition = selfTree[name];
        } else if (this.parent && this.parent.has(name)) {
            return this.parent.compile(name, originCompiler, config);
        } else if (this.root && this.root.has(name)) {
            return this.root.compile(name, originCompiler, config);
        }

        if (!definition) throw new Error(`Dependency injection error. '${name}' not found in the dependency tree`);

        if (definition.hasCompilerPass()) {
            _execCompilerPass.call(this, definition, config);
        }

        if (definition.hasDependencies()) {
            if (resolved.hasOwnProperty(name)) return resolved[name];

            if (selfTree.hasOwnProperty(definition.name)) {
                resolved[definition.name] = new PrivateCompiler().compile(definition, config);

                return resolved[definition.name];
            }

            return new PrivateCompiler().compile(definition);
        }

        const taskRunner = TaskRunner.create();

        const deps = _getDependencies.call(this, ...[name, definition, taskRunner, originCompiler]);
        const service = _resolveService(definition, deps, taskRunner);

        if (!service) throw new Error(`Dependency injection error. Target service ${name} cannot return a falsy value`);

        resolved[definition.name] = service;

        return resolved[definition.name];
    }

    this.add = add;
    this.has = has;
    this.hasOwn = hasOwn;
    this.isResolved = isResolved;
    this.getOwnDefinition = getOwnDefinition;
    this.getDefinition = getDefinition;
    this.compile = compile;
}

function instance() {
    this.create = function() {
        return new factory();
    }
}

module.exports = new instance();