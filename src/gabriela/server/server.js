const restify = require('restify');

const pluginExecuteFactory = require('../plugin/executeFactory');
const moduleExecuteFactory = require('../module/executeFactory');
const {GABRIELA_EVENTS} = require('../misc/types');
const {callSingleGabrielaEvent, runOnAppStarted} = require('../events/util/gabrielaEventUtils');
const validateGabrielaEvents = require('../misc/validateGabrielaEvents');
const validateHttpEvents = require('../misc/validateHttpEvents');

function _resolveOptions(options) {
    const opts = options || {};

    opts.port = (opts.port) ? opts.port : 3000;
    opts.host = (opts.host) ? opts.host : 'localhost';

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

    let server = restify.createServer({
        strictNext: true,
    });

    function run() {
        _runComponents(pluginInterface, moduleInterface, server).then(() => {
            server.listen(opts.port, opts.host, _listenCallback.bind(
                this,
                opts,
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

            this.gabriela.close();

            throw err;
        });
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