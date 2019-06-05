const ModuleTree = require('./moduleTree');
const Server = require('./server/server');
const is = require('./util/is');

const moduleTree = new ModuleTree();
module.exports = {
    asServer: (options) => {
        const server = new Server(options, moduleTree);

        return Object.assign({}, {
            addModule: moduleTree.addModule,
            runServer: server.listen.bind(server),
            closeServer: server.close,
        });
    },

    asRunner: function() {

    }
};