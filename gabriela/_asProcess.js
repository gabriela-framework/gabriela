const ModuleTree = require('./module/moduleTree');
const PluginTree = require('./plugin/pluginTree');
const Compiler = require('./dependencyInjection/compiler');
const configFactory = require('./configFactory');
const Process = require('./process/process');
const ExposedMediator = require('./events/exposedMediator');
const moduleExecutionFactory = require('./module/executeFactory');
const pluginExecutionFactory = require('./plugin/executeFactory');

module.exports = function _asRunner(receivedConfig) {
    const config = configFactory.create(receivedConfig);

    const rootCompiler = Compiler.create();
    const sharedCompiler = Compiler.create();
    const exposedMediator = new ExposedMediator();
    const moduleTree = new ModuleTree(config, rootCompiler, sharedCompiler, exposedMediator);
    const pluginTree = new PluginTree(config, rootCompiler, sharedCompiler, exposedMediator);

    sharedCompiler.name = 'shared';
    rootCompiler.name = 'root';

    const runModule = async function(name) {
        if (name) return await moduleTree.runModule(name, moduleExecutionFactory.bind(null, null));

        return moduleTree.runTree(config, moduleExecutionFactory.bind(null, null));
    };

    const runPlugin = async function(name) {
        if (name) return pluginTree.runPlugin(name, pluginExecutionFactory.bind(null, moduleExecutionFactory, null));

        return pluginTree.runTree(pluginExecutionFactory.bind(null, moduleExecutionFactory, null));
    };

    const moduleInterface = {
        add(mdl) {
            moduleTree.addModule(mdl);
        },
        override: moduleTree.overrideModule,
        get: moduleTree.getModule,
        has: moduleTree.hasModule,
        getAll: moduleTree.getModules,
        remove: moduleTree.removeModule,
        run: runModule,
    };

    const pluginInterface = {
        add: pluginTree.addPlugin,
        get: pluginTree.getPlugin,
        remove: pluginTree.removePlugin,
        getAll: pluginTree.getPlugins,
        has: pluginTree.hasPlugin,
        run: runPlugin,
    };

    const publicInterface = {
        addModule: moduleInterface.add,
        overrideModule: moduleInterface.override,
        getModule: moduleInterface.get,
        removeModule: moduleInterface.remove,
        hasModule: moduleInterface.has,
        getModules: moduleInterface.getAll,
        runModule: moduleInterface.run,
        addPlugin: pluginInterface.add,
        getPlugin: pluginInterface.get,
        removePlugin: pluginInterface.remove,
        hasPlugin: pluginInterface.has,
        getPlugins: pluginInterface.getAll,
        runPlugin: pluginInterface.run,

        startApp(events) {
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