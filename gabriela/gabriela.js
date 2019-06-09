const ModuleTree = require('./module/moduleTree');
const Compiler = require('./dependencyInjection/compiler');
const Server = require('./server/server');
const moduleFactory = require('./module/module');

module.exports = {
    asServer: (options) => {
        const moduleTree = new ModuleTree();
        const rootCompiler = Compiler.create();

        const server = new Server(options, moduleTree);

        // create an interface for the server
        // there can be no private function in fn, only public
        const serverInterface = {
            addModule: function(mdl) {
                moduleTree.addModule(moduleFactory(mdl, rootCompiler));
            },
            runServer: server.listen.bind(server),
            closeServer: server.close,
        };

        return Object.assign({}, serverInterface);
    },

    asRunner: function() {
        const moduleTree = new ModuleTree();
        const rootCompiler = Compiler.create();

        // create an interface for the runner
        // there can be no private function in fn, only public
        const runnerInterface = {
            addModule: function(mdl) {
                moduleTree.addModule(moduleFactory(mdl, rootCompiler));
            },
            getModule: moduleTree.getModule,
            hasModule: moduleTree.hasModule,
            getModules: moduleTree.getModules,
            removeModule: moduleTree.removeModule,
            runModule: (name) => {
                return moduleTree.runModule(name);
            }
        };

        return Object.assign({}, runnerInterface);
    }
};