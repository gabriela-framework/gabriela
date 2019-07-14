const restify = require('restify');

const ServerMediator = require('../events/genericMediator');
const {is, hasKey} = require('../util/util');
const pluginExecuteFactory = require('../plugin/executeFactory');
const moduleExecuteFactory = require('../module/executeFactory');
const {GABRIELA_EVENTS, HTTP_EVENTS} = require('../misc/types');

function _validateEvents(events) {
    if (is('object', events) && hasKey(events, GABRIELA_EVENTS.ON_APP_STARTED)) {
        if (!is('function', events[GABRIELA_EVENTS.ON_APP_STARTED])) throw new Error(`Invalid event. '${GABRIELA_EVENTS.ON_APP_STARTED}' must be a function. Due to this error, the server cannot start.`);
    }

    if (is('object', events) && hasKey(events, GABRIELA_EVENTS.ON_CATCH_ERROR)) {
        if (!is('function', events[GABRIELA_EVENTS.ON_CATCH_ERROR])) throw new Error(`Invalid event. '${GABRIELA_EVENTS.ON_CATCH_ERROR}' must be a function. Due to this error, the server cannot start.`);
    }

    if (is('object', events) && hasKey(events, HTTP_EVENTS.ON_PRE_RESPONSE)) {
        if (!is('function', events[HTTP_EVENTS.ON_PRE_RESPONSE])) throw new Error(`Invalid event. '${HTTP_EVENTS.ON_PRE_RESPONSE}' must be a function. Due to this error, the server cannot start.`);
    }

    if (is('object', events) && hasKey(events, HTTP_EVENTS.ON_POST_RESPONSE)) {
        if (!is('function', events[HTTP_EVENTS.ON_POST_RESPONSE])) throw new Error(`Invalid event. '${HTTP_EVENTS.ON_POST_RESPONSE}' must be a function. Due to this error, the server cannot start.`);
    }
}

function _resolveOptions(options) {
    const opts = options || {};

    opts.port = (opts.port) ? opts.port : 3000;

    return opts;
}
/**
 *
 * Must be run before server because of app crucial plugins, like mongo, mysql, redis etc...
 *
 * TODO: Since 'config' is injected everywhere with for future functionality (?), here is an empty object. Create the
 * TODO: functionality for config
 */
async function _runComponents(pluginInterface, moduleInterface, server) {
    await pluginInterface.run(pluginExecuteFactory.bind(null, moduleExecuteFactory, server));
    await moduleInterface.run(moduleExecuteFactory.bind(null, server));
}

function _callSingleGabrielaEvent(event, rootCompiler, err) {
    const mediator = ServerMediator.create(rootCompiler);

    mediator.callEvent(event, {
        server: this,
        err: err,
    });
}

async function _runGabrielaEvents(events, rootCompiler, err) {
    for (const gEvent of GABRIELA_EVENTS) {
        if (hasKey(events, gEvent)) {
            if (gEvent === GABRIELA_EVENTS.ON_APP_STARTED) {
                try {
                    _callSingleGabrielaEvent.call(this, events[gEvent], rootCompiler, err);
                } catch (onAppStartedError) {
                    // error thrown inside middleware processing takes precendence over and error thrown inside onAppStarted
                    let resolvedError;
                    if (err) {
                        resolvedError = err;
                    } else if (onAppStartedError) {
                        resolvedError = onAppStartedError;
                        resolvedError.message = `An error has been thrown in 'onAppStarted' gabriela event with message: '${onAppStartedError.message}'. This is regarded as an unrecoverable error and the server has closed`;
                    }

                    _callSingleGabrielaEvent.call(this, events[GABRIELA_EVENTS.ON_CATCH_ERROR], rootCompiler, resolvedError);

                    this.close();
                }

                return;
            }

            _callSingleGabrielaEvent.call(this, events[gEvent], rootCompiler, err);
        }
    }
}

async function _listenCallback(
    opts,
    events,
    rootCompiler,
) {
    await _runGabrielaEvents.call(this, events, rootCompiler);
}

function Server(
        options,
        events,
        rootCompiler,
        pluginInterface,
        moduleInterface,
    ) {
    _validateEvents(events);

    const opts = _resolveOptions(options);

    let server = restify.createServer({
        strictNext: true,
    });

    function run() {
        _runComponents(pluginInterface, moduleInterface, server).then(() => {
            server.listen(opts.port, _listenCallback.bind(
                this,
                opts,
                events,
                rootCompiler,
            ));
        }).catch((err) => {
            _runGabrielaEvents.call(this, events, rootCompiler, err);
        });
    }

    function close() {
        server.close();

        server = null;
    }

    this.run = run;
    this.close = close;
}

module.exports = Server;