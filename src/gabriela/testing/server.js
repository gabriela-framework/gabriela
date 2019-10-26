const {GABRIELA_EVENTS} = require('../misc/types');
const {callSingleGabrielaEvent, runOnAppStarted} = require('../events/util/gabrielaEventUtils');
const validateGabrielaEvents = require('../misc/validateGabrielaEvents');
const validateHttpEvents = require('../misc/validateHttpEvents');
const mockRestifyResponse = require('./mock/response');
const mockRequest = require('./mock/request');

function _resolveOptions(options) {
    const opts = options || {};

    opts.port = (opts.port) ? opts.port : 3000;
    opts.host = (opts.host) ? opts.host : 'localhost';

    return opts;
}

function _startServer(opts) {
    const server = {
        response: null
    };

    function get(path, fn) {
        const request = mockRequest(path, 'GET');
        this.response = mockRestifyResponse();

        fn.call(null, request, this.response, function() {});
    }

    server.get = get;

    return server;
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
    opts,
    events,
    rootCompiler,
) {
    const context = {
        gabriela: this,
    };

    console.log(`Gabriela app started on host '${opts.host}' and port: '${opts.port}'`);

    await runOnAppStarted.call(context, events, rootCompiler);
}

function Server(
    options,
    events,
    rootCompiler,
    pluginInterface,
    moduleInterface,
) {
    validateGabrielaEvents(events);
    validateHttpEvents(events);

    const opts = _resolveOptions(options);

    let server = _startServer(opts);

    async function run(moduleExecuteFactory, pluginExecuteFactory) {
        const args = {
            moduleExecuteFactory,
            pluginExecuteFactory,
            pluginInterface,
            moduleInterface,
            server
        };

        try {
            await _runComponents(args);

            return server.response;
        } catch (err) {
            const context = {
                gabriela: this,
            };

            if (events && events[GABRIELA_EVENTS.ON_CATCH_ERROR]) return callSingleGabrielaEvent.call(
                context,
                events[GABRIELA_EVENTS.ON_CATCH_ERROR],
                rootCompiler,
                err
            );

            throw err;
        }
    }

    function close() {
        server.close();

        server = null;

        if (events && events[GABRIELA_EVENTS.ON_EXIT]) return callSingleGabrielaEvent.call(null, events[GABRIELA_EVENTS.ON_EXIT], rootCompiler);
    }

    this.run = run;
    this.close = close;
}

module.exports = Server;