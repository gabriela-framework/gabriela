var Compiler = require('../dependencyInjection/compiler');
var Mediator = require('../events/mediator');
function _createCompiler(plugin, rootCompiler, sharedCompiler) {
    var c = Compiler.create();
    c.name = 'plugin';
    c.root = rootCompiler;
    plugin.sharedCompiler = sharedCompiler;
    plugin.compiler = c;
}
function _adaptModulesToPlugin(plugin) {
    if (plugin.modules && plugin.modules.length > 0) {
        var modules = plugin.modules;
        var hasErrorMediator = (plugin.onError) ? true : false;
        for (var _i = 0, modules_1 = modules; _i < modules_1.length; _i++) {
            var mdl = modules_1[_i];
            mdl.plugin = {
                hasPluginError: hasErrorMediator,
                name: plugin.name,
                hasMediators: plugin.hasMediators,
                mediator: plugin.mediator,
                mediatorInstance: plugin.mediatorInstance,
                hasExposedMediators: plugin.hasExposedMediators()
            };
        }
    }
}
function _bindEventSystem(pluginObject, config, exposedMediatorInstance) {
    pluginObject.mediatorInstance = Mediator.create(pluginObject, config);
    pluginObject.exposedMediator = exposedMediatorInstance;
    if (pluginObject.hasExposedMediators()) {
        var exposedMediators = pluginObject.exposedMediators;
        for (var _i = 0, exposedMediators_1 = exposedMediators; _i < exposedMediators_1.length; _i++) {
            var name_1 = exposedMediators_1[_i];
            pluginObject.exposedMediator.add(name_1);
        }
    }
}
function _createPluginObject(plugin, rootCompiler, sharedCompiler, config, exposedMediatorInstance) {
    var pluginObject = {
        name: plugin.name,
        modules: plugin.modules,
        exposedMediators: plugin.exposedMediators,
        hasExposedMediators: function () {
            return !!plugin.exposedMediators;
        },
        hasModules: function () {
            return plugin.modules.length !== 0;
        },
        compiler: plugin.compiler,
        sharedCompiler: plugin.sharedCompiler,
        hasMediators: function () {
            return !!plugin.mediator;
        },
        mediator: plugin.mediator
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
//# sourceMappingURL=pluginFactory.js.map