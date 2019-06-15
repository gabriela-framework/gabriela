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

        // create an interface for the server
        // there can be no private function in fn, only public
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

        const moduleInterface = {
            addModule: moduleTree.addModule,
            overrideModule: moduleTree.overrideModule,
            getModule: moduleTree.getModule,
            hasModule: moduleTree.hasModule,
            getModules: moduleTree.getModules,
            removeModule: moduleTree.removeModule,
            run: async function(name) {
                const rootCompiler = Compiler.create();

                if (name) return moduleTree.runModule(name, rootCompiler);

                const modules = this.getModules();
                const keys = Object.keys(modules);

                let state = {};

                for (const name of keys) {
                    const res = await moduleTree.runModule(modules[name].name, rootCompiler);

                    state[modules[name].name] = res;
                }

                return deepCopy(state);
            }
        };

        const pluginInterface = {
            addPlugin: pluginTree.addPlugin,
            getPlugin: pluginTree.getPlugin,
            removePlugin: pluginTree.removePlugin,
            getPlugins: pluginTree.getPlugins,
            hasPlugin: pluginTree.hasPlugin,
            run: async function(name) {
                if (name) return pluginTree.runPlugin(name);


            }
        };

        // create an interface for the runner
        // there can be no private function in fn, only public
        return {
            get module() {
                return moduleInterface;
            },

            get plugin() {
                return pluginInterface;
            },

            startApp: function() {

            }
        };
    }
};