const restify = require('restify');

const ServerMediator = require('../events/genericMediator');
const {is, hasKey} = require('../util/util');
const pluginExecuteFactory = require('../plugin/executeFactory');
const moduleExecuteFactory = require('../module/executeFactory');

async function _listenCallback(
    opts,
    events,
    rootCompiler,
) {
    _runEvents.call(this, events, rootCompiler);
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

function _runEvents(events, rootCompiler) {
    if (events && events.onAppStarted) {
        const mediator = ServerMediator.create(rootCompiler);

        mediator.callEvent(events.onAppStarted, {
            server: this,
        });
    }
}

function Server(
        options,
        events,
        rootCompiler,
        pluginInterface,
        moduleInterface,
    ) {
    if (is('object', events) && hasKey(events, 'onAppStarted')) {
        if (!is('function', events.onAppStarted)) {
            throw new Error(`Invalid event. 'onAppStarted' must be a function. Due to this error, the server has closed.`);
        }
    }

    const opts = options || {};

    opts.port = (opts.port) ? opts.port : 3000;

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