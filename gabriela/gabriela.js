const ModuleTree = require('./module/moduleTree');
const Server = require('./server/server');

module.exports = {
    asServer: (options) => {
        const moduleTree = new ModuleTree();

        const server = new Server(options, moduleTree);

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