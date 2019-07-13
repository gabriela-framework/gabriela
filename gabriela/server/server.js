const restify = require('restify');

const ServerMediator = require('../events/genericMediator');
const {is, hasKey} = require('../util/util');
const pluginExecuteFactory = require('../plugin/executeFactory');
const moduleExecuteFactory = require('../module/executeFactory');
const {GABRIELA_EVENTS} = require('../misc/types');

function _validateEvents(events) {
    if (is('object', events) && hasKey(events, 'onAppStarted')) {
        if (!is('function', events.onAppStarted)) throw new Error(`Invalid event. 'onAppStarted' must be a function. Due to this error, the server cannot start.`);
    }

    if (is('object', events) && hasKey(events, 'catchError')) {
        if (!is('function', events.catchError)) throw new Error(`Invalid event. 'catchError' must be a function. Due to this error, the server cannot start.`);
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

function _runEvents(events, rootCompiler, err) {
    for (const gEvent of GABRIELA_EVENTS) {
        if (hasKey(events, gEvent)) {
            const mediator = ServerMediator.create(rootCompiler);

            mediator.callEvent(events[gEvent], {
                server: this,
                err: err,
            });
        }
    }
}

async function _listenCallback(
    opts,
    events,
    rootCompiler,
) {
    _runEvents.call(this, events, rootCompiler);
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
            _runEvents.call(this, events, rootCompiler, err);
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