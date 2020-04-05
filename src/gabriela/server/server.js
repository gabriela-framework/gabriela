const {GABRIELA_EVENTS} = require('../misc/types');
const {callSingleGabrielaEvent, runOnAppStarted} = require('../events/util/gabrielaEventUtils');

function _createServer(config) {
    const express = require('express');
    const app = express();
    const {port, host} = config.server;

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    return {app, port, host};
}

function _mountViewEngineIfExists(server, config) {
    const viewEngine = config.server.viewEngine;

    if (viewEngine.hasViewEngine) {
        server.app.set('views', viewEngine.views);
        server.app.set('view engine', viewEngine['view engine']);
        server.app.engine('jsx', viewEngine['engine']);
    }
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
    server
}) {
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

    await runOnAppStarted.call(context, events, rootCompiler);

    if (config.framework.loggingEnabled) {
        require('./../logging/Logging').outputMemory('App started. All modules and plugins ran.');
    }
}

function Server(
        config,
        events,
        rootCompiler,
        pluginInterface,
        moduleInterface,
    ) {

    let server = _createServer(config);
    _mountViewEngineIfExists(server, config);
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
            console.error(`Fatal error occurred. Since you haven't declared an catchError event, Gabriela has exited. The error message was: ${err.message}`);

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
