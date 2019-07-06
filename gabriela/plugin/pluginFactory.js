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

function _replaceModules(plugin, config, exposedEventsInstance) {
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
                exposedEventsInstance,
            ));
        }

        plugin.modules = factoryModules;
    }
}

function _bindEventSystem(pluginObject, config, exposedEventsInstance) {
    pluginObject.mediatorInstance = Mediator.create(pluginObject, config);

    if (pluginObject.hasExposedEvents()) {
        const exposedEvents = pluginObject.exposedEvents;

        for (const name of exposedEvents) {
            exposedEventsInstance.add(name);
        }
    }
}

function _createPluginObject(plugin, rootCompiler, sharedCompiler, config, exposedEventsInstance) {
    const pluginObject = {
        name: plugin.name,
        modules: plugin.modules,
        exposedEvents: plugin.exposedEvents,
        hasExposedEvents() {
            return !!plugin.exposedEvents;
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
    _bindEventSystem(pluginObject, config, exposedEventsInstance);
    _replaceModules(pluginObject, config, exposedEventsInstance);

    return pluginObject;
}

function factory(plugin, config, rootCompiler, sharedCompiler, exposedEventsInstance) {
    return _createPluginObject(plugin, rootCompiler, sharedCompiler, config, exposedEventsInstance);
}

module.exports = factory;