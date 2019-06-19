const Compiler = require('../dependencyInjection/compiler');
const moduleFactory = require('../module/moduleFactory');

function _createCompiler(plugin, rootCompiler, sharedCompiler) {
    const c = Compiler.create();
    c.name = 'plugin';
    c.root = rootCompiler;

    plugin.sharedCompiler = sharedCompiler;
    plugin.compiler = c;
}

function _replaceModules(plugin) {
    if (plugin.modules && plugin.modules.length > 0) {
        const modules = plugin.modules;
        const factoryModules = [];

        for (const mdl of modules) {
            mdl.plugin = {
                name: plugin.name,
            };

            factoryModules.push(moduleFactory(mdl, plugin.compiler.root, plugin.compiler, plugin.sharedCompiler));
        }

        plugin.modules = factoryModules;
    }
}

function factory(plugin, rootCompiler, sharedCompiler) {
    _createCompiler(plugin, rootCompiler, sharedCompiler);

    _replaceModules(plugin);

    const handlers = {
        set(obj, prop, value) {
            return undefined;
        },

        get(target, prop, receiver) {
            const allowed = ['modules', 'name', 'compiler'];

            if (!allowed.includes(prop)) {
                throw new Error(`Module access error. Trying to access protected property '${prop}' of a module`);
            }

            return target[prop];
        }
    };

    return new Proxy(plugin, handlers);
}

module.exports = factory;