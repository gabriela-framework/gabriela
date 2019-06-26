const Compiler = require('../dependencyInjection/compiler');
const moduleFactory = require('../module/moduleFactory');

function _createCompiler(plugin, rootCompiler, sharedCompiler) {
    const c = Compiler.create();
    c.name = 'plugin';
    c.root = rootCompiler;

    plugin.sharedCompiler = sharedCompiler;
    plugin.compiler = c;
}

function _replaceModules(plugin, config) {
    if (plugin.modules && plugin.modules.length > 0) {
        const modules = plugin.modules;
        const factoryModules = [];

        for (const mdl of modules) {
            mdl.plugin = {
                name: plugin.name,
            };

            factoryModules.push(moduleFactory(mdl, config, plugin.compiler.root, plugin.compiler, plugin.sharedCompiler));
        }

        plugin.modules = factoryModules;
    }
}

function factory(plugin, config, rootCompiler, sharedCompiler) {
    _createCompiler(plugin, rootCompiler, sharedCompiler);

    _replaceModules(plugin, config);

    const handlers = {
        set(obj, prop) {
            throw new Error(`Internal plugin factory error. You cannot add property(s) '${prop}' to an already created 'PluginFactory'`);
        },

        get(target, prop) {
            const allowed = ['modules', 'name', 'compiler', 'sharedCompiler'];

            if (!allowed.includes(prop)) {
                throw new Error(`Plugin access error. Trying to access a protected or non existent property '${prop}' of a '${plugin.name}' plugin`);
            }

            return target[prop];
        }
    };

    return new Proxy(plugin, handlers);
}

module.exports = factory;