const Compiler = require('../dependencyInjection/compiler');
const moduleFactory = require('../module/moduleFactory');
const Mediator = require('../events/mediator');

function _createCompiler(plugin, rootCompiler, sharedCompiler) {
    const c = Compiler.create();
    c.name = 'plugin';
    c.root = rootCompiler;

    plugin.sharedCompiler = sharedCompiler;
    plugin.compiler = c;
}

function _replaceModules(plugin, config, exposedMediatorInstance) {
    if (plugin.modules && plugin.modules.length > 0) {
        const {modules} = plugin;
        const factoryModules = [];

        for (const mdl of modules) {
            mdl.plugin = {
                name: plugin.name,
                mediatorInstance: plugin.mediatorInstance,
            };

            factoryModules.push(moduleFactory(
                mdl,
                config,
                plugin.compiler.root,
                plugin.compiler,
                plugin.sharedCompiler,
                exposedMediatorInstance,
            ));
        }

        plugin.modules = factoryModules;
    }
}

function _bindEventSystem(pluginObject, config, exposedMediatorInstance) {
    pluginObject.mediatorInstance = Mediator.create(pluginObject, config);

    if (pluginObject.hasExposedMediators()) {
        const exposedMediators = pluginObject.exposedMediators;

        for (const name of exposedMediators) {
            exposedMediatorInstance.add(name);
        }
    }
}

function _createPluginObject(plugin, rootCompiler, sharedCompiler, config, exposedMediatorInstance) {
    const pluginObject = {
        name: plugin.name,
        modules: plugin.modules,
        exposedMediators: plugin.exposedMediators,
        hasExposedMediators() {
            return !!plugin.exposedMediators;
        },
        hasModules() {
            return !!plugin.modules;
        },
        compiler: plugin.compiler,
        sharedCompiler: plugin.sharedCompiler,
        hasMediators() {
            return !!plugin.mediator;
        },
        hasPlugins() {
            return !!plugin.plugins;
        },
        plugins: plugin.plugins,
        mediator: plugin.mediator,
    };

    _createCompiler(pluginObject, rootCompiler, sharedCompiler);
    _bindEventSystem(pluginObject, config, exposedMediatorInstance);
    _replaceModules(pluginObject, config, exposedMediatorInstance);

    return pluginObject;
}

function factory(plugin, config, rootCompiler, sharedCompiler, exposedMediatorInstance) {
    return _createPluginObject(plugin, rootCompiler, sharedCompiler, config, exposedMediatorInstance);
}

module.exports = factory;