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

    function post(path, fn) {
        const request = mockRequest(path, 'POST');
        this.response = mockRestifyResponse();

        fn.call(null, request, this.response, function() {});
    }

    server.get = get;
    server.post = post;

    return server;
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

    const context = {
        gabriela: this,
    };

    async function runComponent(name, moduleExecuteFactory, pluginExecuteFactory) {
        try {
            await runOnAppStarted.call(context, events, rootCompiler);

            await moduleInterface.runModule(name, moduleExecuteFactory.bind(null, server));

            return server.response;
        } catch (err) {
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

    this.run = runComponent;
    this.close = close;
}

module.exports = Server;