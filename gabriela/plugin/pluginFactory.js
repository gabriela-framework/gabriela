const Compiler = require('../dependencyInjection/compiler');
const moduleFactory = require('../module/moduleFactory');
const Mediator = require('../events/mediator');
const ModuleTree = require('../module/moduleTree');

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

function _createModuleTree(pluginObject, config, exposedMediator) {
    if (pluginObject.modules && pluginObject.modules.length > 0) {
        const moduleTree = new ModuleTree(config, pluginObject.compiler.root, pluginObject.compiler, pluginObject.sharedCompiler, exposedMediator);

        const {modules} = pluginObject;

        for (const mdl of modules) {
            mdl.plugin = {
                name: pluginObject.name,
                mediatorInstance: pluginObject.mediatorInstance,
            };

            moduleTree.addModule(mdl);
        }

        pluginObject.moduleTree = moduleTree;
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

function _createPluginObject(plugin, rootCompiler, sharedCompiler, config, exposedMediator) {
    const pluginObject = {
        name: plugin.name,
        modules: plugin.modules,
        exposedMediators: plugin.exposedMediators,
        hasExposedMediators() {
            return !!plugin.exposedMediators;
        },
        hasModules() {
            return !!this.moduleTree;
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
    _bindEventSystem(pluginObject, config, exposedMediator);
    _createModuleTree(pluginObject, config, exposedMediator);

    return pluginObject;
}

function factory(plugin, config, rootCompiler, sharedCompiler, exposedMediatorInstance) {
    return _createPluginObject(plugin, rootCompiler, sharedCompiler, config, exposedMediatorInstance);
}

module.exports = factory;