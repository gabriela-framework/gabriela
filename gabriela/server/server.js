const express = require('express');
const app = express();
const http = require('http').createServer(app);
const ServerMediator = require('../events/serverMediator');
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
        const mediator = ServerMediator.create();

        mediator.callEvent(events.onAppStarted, rootCompiler, {
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
    
    if (is('object', events) && hasKey(events, 'onAppStarted')) {
        if (!is('function', events.onAppStarted)) {
            throw new Error(`Invalid event. 'onAppStarted' must be a function. Due to this error, the server has closed.`);
        }
    }

    const opts = options || {};

    opts.port = (opts.port) ? opts.port : 3000;

    let serverInstance = null;

    const native = {
        http,
    };

    function listen() {
        if (serverInstance) {
            process.emitWarning(`Gabriela warning. A server created with this instance of Gabriela is already running. If you which to run another server, create a new instance of Gabriela and run a new server with it.`);

            return;
        }

        serverInstance = native.http.listen(opts.port, listenCallback.bind(
            this,
            opts,
            events,
            rootCompiler,
            pluginInterface,
            moduleInterface,
        ));
    }

    function close() {
        serverInstance.close();

        serverInstance = null;

        console.log('Server closed');
    }

    this.listen = listen;
    this.close = close;
}

module.exports = Server;