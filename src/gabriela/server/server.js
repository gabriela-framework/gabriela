const {GABRIELA_EVENTS, LOGGING_TYPES} = require('../misc/types');
const {callSingleGabrielaEvent, runOnAppStarted} = require('../events/util/gabrielaEventUtils');
const validateGabrielaEvents = require('../misc/validateGabrielaEvents');
const validateHttpEvents = require('../misc/validateHttpEvents');
const LoggerProxy = require('../logging/loggerProxySingleton');
const MemoryLoggerSingleton = require('../logging/memoryLoggerSingleton');

function _resolveOptions(options) {
    if (!options.server) options.server = {};

    options.server.port = (options.server.port) ? options.server.port : 3000;
    options.server.host = (options.server.host) ? options.server.host : 'localhost';
}

function _createServer(opts) {
    const express = require('express');
    const app = express();
    const {port, host} = opts.server;

    return {app, port, host};
}
/**
 *
 * Must be run before server because of app crucial plugins, like mongo, mysql, redis etc...
 *
 * TODO: Since 'config' is injected everywhere with for future functionality (?), here is an empty object. Create the
 * TODO: functionality for config
 */
async function _runComponents({
    moduleExecuteFactory,
    pluginExecuteFactory,
    pluginInterface,
    moduleInterface,
    server}) {

    await pluginInterface.run(pluginExecuteFactory.bind(null, moduleExecuteFactory, server));
    await moduleInterface.run(moduleExecuteFactory.bind(null, server));
}

async function _listenCallback(
    config,
    events,
    rootCompiler,
) {
    const context = {
        gabriela: this,
    };

    const serverConfig = config.server;

    LoggerProxy.log(LOGGING_TYPES.NOTICE, `Gabriela app started on host '${serverConfig.host}' and port: '${serverConfig.port}'`);
    LoggerProxy.log(LOGGING_TYPES.NOTICE, `Running in '${config.framework.env}' environment`);

    const memory = process.memoryUsage().heapUsed / 1024 / 1024;

    MemoryLoggerSingleton.log(
        memory,
        `Start memory usage: ${Math.round(memory * 100) / 100}MB`
    );

    await runOnAppStarted.call(context, events, rootCompiler);
}

function Server(
        config,
        events,
        rootCompiler,
        pluginInterface,
        moduleInterface,
    ) {
    validateGabrielaEvents(events);
    validateHttpEvents(events);

    _resolveOptions(config);

    let server = _createServer(config);
    let serverInstance = null;

    function run(moduleExecuteFactory, pluginExecuteFactory) {
        const args = {
            moduleExecuteFactory: moduleExecuteFactory,
            pluginExecuteFactory: pluginExecuteFactory,
            pluginInterface: pluginInterface,
            moduleInterface: moduleInterface,
            server: server.app,
        };

        _runComponents(args).then(() => {
            serverInstance = server.app.listen(server.port, server.host, _listenCallback.bind(
                this,
                config,
                events,
                rootCompiler,
            ));
        }).catch((err) => {
            const context = {
                gabriela: this,
            };

            if (events && events[GABRIELA_EVENTS.ON_CATCH_ERROR]) return callSingleGabrielaEvent.call(
                context,
                events[GABRIELA_EVENTS.ON_CATCH_ERROR],
                rootCompiler,
                err
            );

            /**
             * This code cannot be tested since gabriela has to exit and if it does so, node process is killed too, along
             * with the process that tests are executed in
             */
            console.log(`Fatal error occurred. Since you haven't declared an catchError event, Gabriela has exited. The error message was: ${err.message}`);

            this.close();

            throw err;
        });
    }

    function close() {
        if (serverInstance) {
            serverInstance.close();
        }

        server = null;
        serverInstance = null;

        if (events && events[GABRIELA_EVENTS.ON_EXIT]) return callSingleGabrielaEvent.call(null, events[GABRIELA_EVENTS.ON_EXIT], rootCompiler);
    }

    this.run = run;
    this.close = close;
}

module.exports = Server;
