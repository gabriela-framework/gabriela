const {GABRIELA_EVENTS} = require('../misc/types');
const pluginExecuteFactory = require('../plugin/executeFactory');
const moduleExecuteFactory = require('../module/executeFactory');
const {runOnAppStarted, callSingleGabrielaEvent} = require('../events/util/gabrielaEventUtils');

async function runApp(
    config,
    events,
    rootCompiler,
    pluginInterface,
    moduleInterface,
) {
    try {
        const context = {
            gabriela: this,
        };

        await pluginInterface.run(pluginExecuteFactory.bind(null, moduleExecuteFactory, null));
        await moduleInterface.run(moduleExecuteFactory.bind(null, null));

        await runOnAppStarted.call(context, events, rootCompiler);

        if (events && events[GABRIELA_EVENTS.ON_EXIT]) return callSingleGabrielaEvent.call(null, events[GABRIELA_EVENTS.ON_EXIT], rootCompiler);

        const env = config['framework']['env'];
        require('./../logging/Logging').outputMemory(`'App started in '${env}' environment and mounted as process. All modules and plugins ran.'`);
    } catch (err) {
        if (events && events[GABRIELA_EVENTS.ON_CATCH_ERROR]) {
            return callSingleGabrielaEvent.call(this, events[GABRIELA_EVENTS.ON_CATCH_ERROR], rootCompiler, err);
        }

        console.log(`Fatal error occurred. Since you haven't declared an catchError event, Gabriela has exited. The error message was: ${err.message}`);

        if (events && events[GABRIELA_EVENTS.ON_EXIT]) return callSingleGabrielaEvent.call(null, events[GABRIELA_EVENTS.ON_EXIT], rootCompiler);

        this.close();
    }
}

function factory(
    config,
    events,
    rootCompiler,
    pluginInterface,
    moduleInterface,
) {
    function run() {
        return runApp.call(
            this,
            config,
            events,
            rootCompiler,
            pluginInterface,
            moduleInterface,
        );
    }

    function close() {
        process.on('SIGTERM', () => {
            if (events && events[GABRIELA_EVENTS.ON_EXIT]) return callSingleGabrielaEvent.call(null, events[GABRIELA_EVENTS.ON_EXIT], rootCompiler);
        });

        console.log(`Process has exited`);

        process.kill(process.pid, 'SIGTERM');
    }

    this.close = close;
    this.run = run;
}

module.exports = factory;
