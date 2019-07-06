const restify = require('restify');

const ServerMediator = require('../events/genericMediator');
const {is, hasKey} = require('../util/util');

async function listenCallback(
    opts,
    events,
    rootCompiler,
    pluginInterface,
    moduleInterface,
) {
    await pluginInterface.run();
    await moduleInterface.run();

    if (events && events.onAppStarted) {
        const mediator = ServerMediator.create(rootCompiler);

        mediator.callEvent(events.onAppStarted, {
            server: this,
        });
    }

    console.log(`Server started on port ${opts.port}`);
}

function Server(
        options, 
        events,
        rootCompiler,
        pluginInterface, 
        moduleInterface,
    ) {

    let server = restify.createServer({
        strictNext: true,
    });
    
    if (is('object', events) && hasKey(events, 'onAppStarted')) {
        if (!is('function', events.onAppStarted)) {
            throw new Error(`Invalid event. 'onAppStarted' must be a function. Due to this error, the server has closed.`);
        }
    }

    const opts = options || {};

    opts.port = (opts.port) ? opts.port : 3000;

    function run() {
        server.listen(opts.port, listenCallback.bind(
            this,
            opts,
            events,
            rootCompiler,
            pluginInterface,
            moduleInterface,
        ));
    }

    function close() {
        server.close();

        server = null;
    }

    this.run = run;
    this.close = close;
}

module.exports = Server;