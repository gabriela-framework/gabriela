const Compiler = require('../dependencyInjection/compiler');
const moduleFactory = require('../module/moduleFactory');

function createCompiler(plugin, rootCompiler) {
    const c = Compiler.create();
    c.root = rootCompiler;

    return c;
}

function replaceModules(plugin, pluginCompiler) {
    if (plugin.modules && plugin.modules.length > 0) {
        const modules = plugin.modules;
        const factoryModules = [];

        for (const mdl of modules) {
            factoryModules.push(moduleFactory(mdl, pluginCompiler.root, pluginCompiler));
        }

        plugin.modules = factoryModules;
    }
}

function factory(plugin, rootCompiler) {
    const compiler = createCompiler(plugin, rootCompiler);
    replaceModules(plugin, compiler);

    const handlers = {
        set(obj, prop, value) {
            return undefined;
        },

        get(target, prop, receiver) {
            const allowed = ['modules', 'name'];

            if (!allowed.includes(prop)) {
                throw new Error(`Module access error. Trying to access protected property '${prop}' of a module`);
            }

            return target[prop];
        }
    };

    return new Proxy(plugin, handlers);
}

module.exports = factory;