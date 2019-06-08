const ModuleTree = require('./module/moduleTree');
const Server = require('./server/server');

module.exports = {
    asServer: (options) => {
        const moduleTree = new ModuleTree();

        const server = new Server(options, moduleTree);

        // create an interface for the server
        // there can be no private function in fn, only public
        return Object.assign({}, {
            addModule: moduleTree.addModule,
            runServer: server.listen.bind(server),
            closeServer: server.close,
        });
    },

    asRunner: function() {
        const moduleTree = new ModuleTree();

        const tree = {
            parent: null,
            child: null
        };

        // create an interface for the runner
        // there can be no private function in fn, only public
        const fn = {
            addModule: moduleTree.addModule,
            getModule: moduleTree.getModule,
            hasModule: moduleTree.hasModule,
            getModules: moduleTree.getModules,
            removeModule: moduleTree.removeModule,
            runModule: moduleTree.runModule,
        };

        return Object.assign({}, tree, fn);
    }
};