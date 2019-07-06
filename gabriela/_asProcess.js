const deepCopy = require('deepcopy');

const ModuleTree = require('./module/moduleTree');
const PluginTree = require('./plugin/pluginTree');
const Compiler = require('./dependencyInjection/compiler');
const configFactory = require('./configFactory');
const Process = require('./process/process');
const ExposedMediator = require('./events/exposedMediator');

module.exports = function _asRunner(receivedConfig) {
    const config = configFactory.create(receivedConfig);

    const rootCompiler = Compiler.create();
    const sharedCompiler = Compiler.create();
    const exposedMediator = new ExposedMediator();
    const moduleTree = new ModuleTree(config, rootCompiler, null, sharedCompiler, exposedMediator);
    const pluginTree = new PluginTree(config, rootCompiler, null, sharedCompiler, exposedMediator);

    sharedCompiler.name = 'shared';
    rootCompiler.name = 'root';

    const runModule = async function(name) {
        if (name) return await moduleTree.runModule(name);

        const getModules = (this.getAll) ? this.getAll : this.getModules;

        const modules = getModules();
        const keys = Object.keys(modules);

        const state = {};

        for (const name of keys) {
            const res = await moduleTree.runModule(modules[name].name);

            state[modules[name].name] = res;
        }

        return deepCopy(state);
    };

    const runPlugin = async function(name) {
        if (name) return pluginTree.runPlugin(name);

        const getPlugins = (this.getAll) ? this.getAll : this.getPlugins;

        const plugins = getPlugins();
        const keys = Object.keys(plugins);

        for (const name of keys) {
            await pluginTree.runPlugin(plugins[name].name);
        }
    };

    const moduleInterface = {
        add: moduleTree.addModule,
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