const Compiler = require('../dependencyInjection/compiler');
const Mediator = require('../events/mediator');

function _createCompiler(plugin, rootCompiler, sharedCompiler) {
    const c = Compiler.create();
    c.name = 'plugin';
    c.root = rootCompiler;

    plugin.sharedCompiler = sharedCompiler;
    plugin.compiler = c;
}

function _adaptModulesToPlugin(plugin) {
    if (plugin.modules && plugin.modules.length > 0) {
        const {modules} = plugin;

        for (const mdl of modules) {
            mdl.plugin = {
                name: plugin.name,
                mediatorInstance: plugin.mediatorInstance,
                hasExposedMediators: plugin.hasExposedMediators(),
            };
        }
    }
}

function _bindEventSystem(pluginObject, config, exposedMediatorInstance) {
    pluginObject.mediatorInstance = Mediator.create(pluginObject, config);
    pluginObject.exposedMediator = exposedMediatorInstance;

    if (pluginObject.hasExposedMediators()) {
        const {exposedMediators} = pluginObject;

        for (const name of exposedMediators) {
            pluginObject.exposedMediator.add(name);
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
    _adaptModulesToPlugin(pluginObject, config, exposedMediatorInstance);

    return pluginObject;
}

function factory(plugin, config, rootCompiler, sharedCompiler, exposedMediatorInstance) {
    return _createPluginObject(plugin, rootCompiler, sharedCompiler, config, exposedMediatorInstance);
}

module.exports = factory;