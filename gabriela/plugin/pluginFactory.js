const Compiler = require('../dependencyInjection/compiler');
const moduleFactory = require('../module/moduleFactory');
const Mediator = require('../events/mediator');
const ExposedEvents = require('../events/exposedEvents');

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
                mediatorInstance: plugin.mediatorInstance,
                exposedEventsInstance: plugin.exposedEventsInstance,
            };

            factoryModules.push(moduleFactory(mdl, config, plugin.compiler.root, plugin.compiler, plugin.sharedCompiler));
        }

        plugin.modules = factoryModules;
    }
}

function _bindEventSystem(pluginObject, config) {
    pluginObject.mediatorInstance = Mediator.create(pluginObject, config);
    const exposedEventsInstance = new ExposedEvents();

    if (pluginObject.hasExposedEvents()) {
        const exposedEvents = pluginObject.exposedEvents;

        for (const eventDefinition of exposedEvents) {
            exposedEventsInstance.add(eventDefinition);
        }
    }

    pluginObject.exposedEventsInstance = exposedEventsInstance;
}

function _createPluginObject(plugin, rootCompiler, sharedCompiler, config) {
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
    _bindEventSystem(pluginObject, config);
    _replaceModules(pluginObject, config);

    return pluginObject;
}

function factory(plugin, config, rootCompiler, sharedCompiler) {
    return _createPluginObject(plugin, rootCompiler, sharedCompiler, config);
}

module.exports = factory;