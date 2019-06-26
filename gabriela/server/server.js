const express = require('express');
const app = express();
const http = require('http').createServer(app);
const Validator = require('../misc/validator');

function Server(options, moduleTree) {
    options = options || {};

    Validator.validateServerOptions(options);

    options.port = (options.port) ? options.port : 3000;

    let serverInstance = null;

    const native = {
        http: http,
    };

    this.listen = function() {
        serverInstance = native.http.listen(options.port, function() {
            if (options.runCallback) options.runCallback.call();

            const modules = moduleTree.getModules();
            const keys = Object.keys(modules);

            for (const m of keys) {
                const mld = modules[m];

                if (mld.http) {
                    const route = mld.http.route;

                    app[route.method](route.path, (req, res) => {
                        moduleTree.runModule(mld.name, Object.assign({}, mld.http, req, res));
                    });
                }
            }

            console.log(`Server started on port ${options.port}`);
        });
    };

    this.close = function() {
        serverInstance.close();

        serverInstance = null;
    }
}

module.exports = Server;