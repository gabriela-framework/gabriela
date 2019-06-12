const ModuleTree = require('./module/moduleTree');
const Compiler = require('./dependencyInjection/compiler');
const Server = require('./server/server');
const moduleFactory = require('./module/module');
const deepCopy = require('deepcopy');

module.exports = {
    asServer: (options) => {
        const moduleTree = new ModuleTree();
        const rootCompiler = Compiler.create();

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
        const rootCompiler = Compiler.create();

        const moduleInterface = {
            addModule: function(mdl) {
                moduleTree.addModule(moduleFactory(mdl, rootCompiler));
            },
            getModule: moduleTree.getModule,
            hasModule: moduleTree.hasModule,
            getModules: moduleTree.getModules,
            removeModule: moduleTree.removeModule,
            run: async function(name) {
                if (name) return moduleTree.runModule(name);

                const modules = this.getModules();
                const keys = Object.keys(modules);

                let state = {};

                for (const name of keys) {
                    const res = await moduleTree.runModule(modules[name].name);

                    state[modules[name].name] = res;
                }

                return deepCopy(state);
            }
        };

        const pluginInterface = {

        };


        // create an interface for the runner
        // there can be no private function in fn, only public
        return {
            get module() {
                return moduleInterface;
            },

            get plugin() {
                return pluginInterface;
            }
        };
    }
};