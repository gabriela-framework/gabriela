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
        const {modules} = plugin;
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

function _createPluginObject(plugin) {
    return {
        name: plugin.name,
        modules: plugin.modules,
        hasModules: function() {
            return !!plugin.modules;
        },
        compiler: plugin.compiler,
        sharedCompiler: plugin.sharedCompiler,
        hasMediators: function() {
            return !!plugin.mediator;
        },
        mediator: plugin.mediator,
    }
}

function factory(plugin, config, rootCompiler, sharedCompiler) {
    _createCompiler(plugin, rootCompiler, sharedCompiler);

    _replaceModules(plugin, config);

    return _createPluginObject(plugin);
}

module.exports = factory;