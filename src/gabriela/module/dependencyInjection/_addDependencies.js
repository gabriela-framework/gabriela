const deepCopy = require('deepcopy');
const Validator = require('../../misc/validator');
const {hasKey} = require('../../util/util');

function _addDependencies(mdl, config) {
    const {dependencies} = mdl;

    for (const definition of dependencies) {
        _addDependency(mdl, definition, config);
    }
}

function _compileAddProxy(mdl, config) {
    return function(definition) {
        Validator.validateDefinitionObject(definition);

        _addDependency(mdl, definition, config);
    }
}

function _execCompilerPass(mdl, definition, config, addProxy) {
    const {compilerPass} = definition;

    const handlers = {
        set() { return undefined; },

        get(target, prop) {
            if (prop === 'compile') throw new Error(`Dependency injection error in service '${definition.name}'. Compiling inside a compiler pass is forbidden`);

            if (prop === 'add') return addProxy;
            return target[prop];
        }
    };

    let possibleConfig = config;
    if (compilerPass.property) {
        if (!hasKey(config.config, compilerPass.property)) throw new Error(`Dependency injection error in a compiler pass in service '${definition.name}'. Property '${compilerPass.property}' does not exist in config`);

        possibleConfig = config.config[compilerPass.property];
    }

    compilerPass.init.call(null, ...[deepCopy(possibleConfig), new Proxy(this, handlers)]);
}

function _addDependency(mdl, definition, config) {
    if (!definition.scope && !definition.shared) definition.scope = 'module';

    if (definition.scope) {
        if (definition.scope === 'module') {
            if (!mdl.compiler.hasOwn(definition.name)) {
                mdl.compiler.add(definition);
            }
        } else if (definition.scope === 'plugin') {
            if (!mdl.compiler.parent) throw new Error(`Dependency injection error. Module '${mdl.name}' has a dependency with name '${definition.name}' that has a 'plugin' scope but this module is not run within a plugin. Change the visibility of this dependency to 'module' or 'public' or add this module to a plugin`);

            if (!mdl.compiler.parent.hasOwn(definition.name)) {
                mdl.compiler.parent.add(definition);
            }
        } else if (definition.scope === 'public') {
            if (!mdl.compiler.root.hasOwn(definition.name)) {
                mdl.compiler.root.add(definition);
            }
        }

        const definitionObject = mdl.compiler.getDefinition(definition.name);

        if (definitionObject.hasCompilerPass()) {
            _execCompilerPass.call(mdl.compiler, mdl, definitionObject, config, _compileAddProxy(mdl, config));
        }
    }

    if (definition.shared) {
        const {modules, plugins} = definition.shared;

        if (modules) {
            for (const mdlName of modules) {
                if (mdlName === mdl.name) mdl.sharedCompiler.add(definition);
            }
        }

        if (plugins) {
            for (const pluginName of plugins) {
                mdl.sharedCompiler.add(definition);
            }
        }
    }
}

module.exports = _addDependencies;