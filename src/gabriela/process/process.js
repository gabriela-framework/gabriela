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
        await pluginInterface.run(pluginExecuteFactory.bind(null, moduleExecuteFactory, null));
        await moduleInterface.run(moduleExecuteFactory.bind(null, null));
    } catch (e) {
        if (events && events[GABRIELA_EVENTS.ON_CATCH_ERROR]) {
            return callSingleGabrielaEvent.call(this, events[GABRIELA_EVENTS.ON_CATCH_ERROR], rootCompiler, e);
        }

        console.log(`Fatal error occurred. Since you haven't declared an catchError event, Gabriela has exited. The error message was: ${e.message}`);

        this.close();
    }

    const context = {
        gabriela: this,
    };

    await runOnAppStarted.call(context, events, rootCompiler);

    console.log(`Process app started`);
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
        console.log(`Process has exited`);

        process.exit(0);
    }

    this.close = close;
    this.run = run;
}

module.exports = factory;