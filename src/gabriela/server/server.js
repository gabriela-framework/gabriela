const {GABRIELA_EVENTS} = require('../misc/types');
const {callSingleGabrielaEvent, runOnAppStarted} = require('../events/util/gabrielaEventUtils');
const ShutdownManager = require('./shutdownManager');

function _shutdown(server, events, rootCompiler, shutdownManager) {
    if (server) {
        shutdownManager.shutdown(() => {
            console.log('All connections closed. Server terminated.');

            if (events && events[GABRIELA_EVENTS.ON_EXIT]) return callSingleGabrielaEvent.call(null, events[GABRIELA_EVENTS.ON_EXIT], rootCompiler);
        });
    }
}

function _addMiddleware(app, middleware) {
    for (const m of middleware) {
        app.use(m);
    }
}

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

    const env = config['framework']['env'];
    const host = config['server']['host'];
    const port = config['server']['port'];
    require('./../logging/Logging').outputMemory(`'App started in '${env}' environment and mounted as server on host '${host}' and port '${port}'. All modules and plugins ran.'`);
}

function Server(
        config,
        events,
        rootCompiler,
        pluginInterface,
        moduleInterface,
    ) {

    const env = config['framework']['env'];
    let server = _createServer(config);

    _addMiddleware(server.app, config.server.expressMiddleware);
    _mountViewEngineIfExists(server, config);
    let serverInstance = null;

    let shutdownManager = null;

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

            shutdownManager = new ShutdownManager(serverInstance);
            shutdownManager.startWatching();
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

    if (env === 'prod') {
        process.on('SIGINT', () => {
            this.close();
        });

        process.on('SIGTERM', () => {
            this.close();
        });
    }

    function close() {
        _shutdown(serverInstance, events, rootCompiler, shutdownManager, env);

        serverInstance = null;
        server = null;
    }

    this.run = run;
    this.close = close;
}

module.exports = Server;
