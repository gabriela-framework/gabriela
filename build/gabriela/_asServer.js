var pluginExecuteFactory = require('./plugin/executeFactory');
var moduleExecuteFactory = require('./module/executeFactory');
var ModuleTree = require('./module/moduleTree');
var PluginTree = require('./plugin/pluginTree');
var Compiler = require('./dependencyInjection/compiler');
var Server = require('./server/server');
var ExposedMediator = require('./events/exposedMediator');
var Names = require('./nameSingleton');
var Router = require('./router/router');
var Validator = require('./misc/validator');
var deepcopy = require('deepcopy');
module.exports = function _asServer(config) {
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
            var immutableModule = deepcopy(mdl);
            if (names.has(immutableModule.name)) {
                throw new Error("Module definition error. Module with name '" + immutableModule.name + "' already exists");
            }
            names.add(immutableModule.name);
            moduleTree.addModule(immutableModule);
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
            var immutablePlugin = deepcopy(plugin);
            if (names.has(immutablePlugin.name)) {
                throw new Error("Plugin definition error. Plugin with name '" + immutablePlugin.name + "' already exists");
            }
            var valid = names.addAndReplacePluginNames(immutablePlugin);
            if (valid !== true) {
                throw new Error("Plugin definition error. Plugin module with name '" + valid + "' already exists");
            }
            pluginTree.addPlugin(immutablePlugin);
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
            var server = new Server(config, events, rootCompiler, pluginInterface, moduleInterface);
            server.run(moduleExecuteFactory, pluginExecuteFactory);
        }
    };
    return publicInterface;
};
//# sourceMappingURL=_asServer.js.map