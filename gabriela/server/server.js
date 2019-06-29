const express = require('express');
const app = express();
const http = require('http').createServer(app);

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

    // the order of server execution is plugins first, then modules
    // that enables third party plugins that should be added first to be executed
    // before client plugins
    this.listen = function() {
        serverInstance = native.http.listen(opts.port, async function() {
            if (opts.runCallback) opts.runCallback.call(null);

            console.log(`Server started on port ${opts.port}`);
        });
    };

    this.close = function() {
        serverInstance.close();

        serverInstance = null;
    };
}

module.exports = Server;