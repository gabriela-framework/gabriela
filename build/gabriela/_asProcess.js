var ModuleTree = require('./module/moduleTree');
var PluginTree = require('./plugin/pluginTree');
var Compiler = require('./dependencyInjection/compiler');
var Process = require('./process/process');
var ExposedMediator = require('./events/exposedMediator');
var Names = require('./nameSingleton');
var Router = require('./router/router');
var Validator = require('./misc/validator');
module.exports = function _asProcess(config) {
    var names = Names.create();
    var rootCompiler = Compiler.create();
    var sharedCompiler = Compiler.create();
    var exposedMediator = new ExposedMediator();
    var moduleTree = new ModuleTree(config, rootCompiler, sharedCompiler, exposedMediator);
    var pluginTree = new PluginTree(config, rootCompiler, sharedCompiler, exposedMediator);
    sharedCompiler.name = 'shared';
    rootCompiler.name = 'root';
    var moduleInterface = {
        add: function (mdl) {
            Validator.validateModule(mdl, Router);
            if (names.has(mdl.name)) {
                throw new Error("Module definition error. Module with name '" + mdl.name + "' already exists");
            }
            names.add(mdl.name);
            moduleTree.addModule(mdl);
        },
        override: moduleTree.overrideModule,
        get: moduleTree.getModule,
        has: moduleTree.hasModule,
        getAll: moduleTree.getModules,
        remove: moduleTree.removeModule
    };
    var pluginInterface = {
        add: function (plugin) {
            Validator.validatePlugin(plugin, Router);
            if (names.has(plugin.name)) {
                throw new Error("Plugin definition error. Plugin with name '" + plugin.name + "' already exists");
            }
            var valid = names.addAndReplacePluginNames(plugin);
            if (valid !== true) {
                throw new Error("Plugin definition error. Plugin module with name '" + valid + "' already exists");
            }
            pluginTree.addPlugin(plugin);
        },
        get: pluginTree.getPlugin,
        remove: pluginTree.removePlugin,
        getAll: pluginTree.getPlugins,
        has: pluginTree.hasPlugin
    };
    var publicInterface = {
        addModule: moduleInterface.add,
        overrideModule: moduleInterface.override,
        getModule: moduleInterface.get,
        removeModule: moduleInterface.remove,
        hasModule: moduleInterface.has,
        getModules: moduleInterface.getAll,
        addPlugin: pluginInterface.add,
        getPlugin: pluginInterface.get,
        removePlugin: pluginInterface.remove,
        hasPlugin: pluginInterface.has,
        getPlugins: pluginInterface.getAll,
        startApp: function () {
            var events = config.events;
            pluginInterface.run = pluginTree.runTree.bind(pluginTree);
            moduleInterface.run = moduleTree.runTree.bind(moduleTree);
            var process = new Process(config, events, rootCompiler, pluginInterface, moduleInterface);
            return process.run();
        }
    };
    return publicInterface;
};
//# sourceMappingURL=_asProcess.js.map