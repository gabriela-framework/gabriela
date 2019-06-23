const deepCopy = require('deepcopy');

const ModuleTree = require('./module/moduleTree');
const PluginTree = require('./plugin/pluginTree');
const Compiler = require('./dependencyInjection/compiler');
const Server = require('./server/server');
const moduleFactory = require('./module/moduleFactory');

module.exports = {
    asServer: (options) => {
        const moduleTree = new ModuleTree();

        const server = new Server(options, moduleTree);

        return {
            addModule: function(mdl) {
                moduleTree.addModule(moduleFactory(mdl, rootCompiler));
            },
            runServer: server.listen.bind(server),
            closeServer: server.close,
        };
    },

    asRunner: function() {
        const moduleTree = new ModuleTree();
        const pluginTree = new PluginTree();
        const rootCompiler = Compiler.create();
        const sharedCompiler = Compiler.create();

        sharedCompiler.name = 'shared';
        rootCompiler.name = 'root';

        const runModule = async function(name) {
            if (name) return await moduleTree.runModule(name, rootCompiler, null, sharedCompiler);

            const modules = this.getModules();
            const keys = Object.keys(modules);

            let state = {};

            for (const name of keys) {
                const res = await moduleTree.runModule(modules[name].name, rootCompiler, null, sharedCompiler);

                state[modules[name].name] = res;
            }

            return deepCopy(state);
        };

        const runPlugin = async function(name) {
            if (name) return pluginTree.runPlugin(name, rootCompiler, sharedCompiler);

            const plugins = this.getPlugins();
            const keys = Object.keys(plugins);

            for (const name of keys) {
                await pluginTree.runPlugin(plugins[name].name, rootCompiler, sharedCompiler);
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
            get moduleFactory() { return moduleInterface; },
            get pluginFactory() { return pluginInterface; },

            startApp: function() {

            }
        };

        return publicInterface;
    }
};