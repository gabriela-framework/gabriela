"use strict";

const deepCopy = require('deepcopy');

const ModuleTree = require('./module/moduleTree');
const PluginTree = require('./plugin/pluginTree');
const Compiler = require('./dependencyInjection/compiler');
const configFactory = require('./configFactory');
const Server = require('./server/server');
const Validator = require('./misc/validator');

module.exports = function _asServer(receivedConfig) {
    const config = configFactory.create(receivedConfig);

    Validator.validateServerOptions(config.server);

    const moduleTree = new ModuleTree();
    const pluginTree = new PluginTree();
    const rootCompiler = Compiler.create();
    const sharedCompiler = Compiler.create();

    sharedCompiler.name = 'shared';
    rootCompiler.name = 'root';

    async function runModule(name) {
        if (name) return await moduleTree.runModule(
            name,
            config,
            rootCompiler,
            null,
            sharedCompiler
        );

        const modules = this.getAll();
        const keys = Object.keys(modules);

        const state = {};

        for (const name of keys) {
            const res = await moduleTree.runModule(
                modules[name].name,
                config,
                rootCompiler,
                null,
                sharedCompiler,
            );

            state[modules[name].name] = res;
        }

        return deepCopy(state);
    };

    async function runPlugin(name) {
        if (name) return pluginTree.runPlugin(name, config, rootCompiler, sharedCompiler);

        const plugins = this.getAll();
        const keys = Object.keys(plugins);

        for (const name of keys) {
            await pluginTree.runPlugin(plugins[name].name, config, rootCompiler, sharedCompiler);
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
        runModule: runModule,
        addPlugin: pluginInterface.add,
        getPlugin: pluginInterface.get,
        removePlugin: pluginInterface.remove,
        hasPlugin: pluginInterface.has,
        getPlugins: pluginInterface.getAll,
        runPlugin: runPlugin,

        startApp(events) {

            const server = new Server(
                config.server,
                events,
                rootCompiler,
                pluginInterface,
                moduleInterface,
            );

            server.listen();
        }
    };

    return publicInterface;
}