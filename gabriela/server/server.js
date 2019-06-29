const express = require('express');
const app = express();
const http = require('http').createServer(app);

async function listenCallback(opts) {
    console.log(`Server started on port ${opts.port}`);
}

function Server(
        options, 
        pluginTree, 
        moduleTree, 
        rootCompiler, 
        sharedCompiler
    ) {

    const opts = options || {};

    opts.port = (opts.port) ? opts.port : 3000;

    let serverInstance = null;

    const native = {
        http,
    };

    function listen() {
        if (serverInstance) process.emitWarning(`Gabriela warning. A server created with this instance of Gabriela is already running. If you which to run another server, create a new instance of Gabriela and run a new server with it.`);

        serverInstance = native.http.listen(opts.port, listenCallback.bind(this, opts));
    };

    function close() {
        serverInstance.close();

        serverInstance = null;

        console.log('Server closed');
    }

    this.listen = listen;
    this.close = close;
}

module.exports = Server;