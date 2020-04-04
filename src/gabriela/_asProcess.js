const ModuleTree = require('./module/moduleTree');
const PluginTree = require('./plugin/pluginTree');
const Compiler = require('./dependencyInjection/compiler');
const Process = require('./process/process');
const ExposedMediator = require('./events/exposedMediator');
const Names = require('./nameSingleton');
const Router = require('./router/router');
const Validator = require('./misc/validator');

module.exports = function _asProcess(config) {
    const names = Names.create();
    const rootCompiler = Compiler.create();
    const sharedCompiler = Compiler.create();
    const exposedMediator = new ExposedMediator();
    const moduleTree = new ModuleTree(config, rootCompiler, sharedCompiler, exposedMediator);
    const pluginTree = new PluginTree(config, rootCompiler, sharedCompiler, exposedMediator);

    sharedCompiler.name = 'shared';
    rootCompiler.name = 'root';

    const moduleInterface = {
        add(mdl) {
            Validator.validateModule(mdl, Router);

            if (names.has(mdl.name)) {
                throw new Error(`Module definition error. Module with name '${mdl.name}' already exists`);
            }

            names.add(mdl.name);

            moduleTree.addModule(mdl);
        },
        override: moduleTree.overrideModule,
        get: moduleTree.getModule,
        has: moduleTree.hasModule,
        getAll: moduleTree.getModules,
        remove: moduleTree.removeModule,
    };

    const pluginInterface = {
        add(plugin) {
            Validator.validatePlugin(plugin, Router);

            if (names.has(plugin.name)) {
                throw new Error(`Plugin definition error. Plugin with name '${plugin.name}' already exists`);
            }

            const valid = names.addPluginModules(plugin);

            if (valid !== true) {
                throw new Error(`Plugin definition error. Plugin module with name '${valid}' already exists`);
            }

            names.add(plugin.name);

            pluginTree.addPlugin(plugin);
        },
        get: pluginTree.getPlugin,
        remove: pluginTree.removePlugin,
        getAll: pluginTree.getPlugins,
        has: pluginTree.hasPlugin,
    };

    const publicInterface = {
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

        startApp() {
            const events = config.events;

            pluginInterface.run = pluginTree.runTree.bind(pluginTree);
            moduleInterface.run = moduleTree.runTree.bind(moduleTree);

            const process = new Process(
                config,
                events,
                rootCompiler,
                pluginInterface,
                moduleInterface,
            );

            return process.run();
        }
    };

    return publicInterface;
};
