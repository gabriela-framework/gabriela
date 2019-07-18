const restify = require('restify');

const {is, hasKey} = require('../util/util');
const pluginExecuteFactory = require('../plugin/executeFactory');
const moduleExecuteFactory = require('../module/executeFactory');
const {GABRIELA_EVENTS, HTTP_EVENTS} = require('../misc/types');
const {_runGabrielaEvents, _callSingleGabrielaEvent} = require('../events/util/gabrielaEventUtils');
const validateGabrielaEvents = require('../misc/validateGabrielaEvents');
const validateHttpEvents = require('../misc/validateHttpEvents');

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

async function _listenCallback(
    opts,
    events,
    rootCompiler,
) {
    await _runGabrielaEvents.call(this, events, rootCompiler);

    console.log('Gabriela app started');
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
            if (events[GABRIELA_EVENTS.ON_CATCH_ERROR]) return _callSingleGabrielaEvent.call(
                this,
                events[GABRIELA_EVENTS.ON_CATCH_ERROR],
                rootCompiler,
                err
            );

            throw err;
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