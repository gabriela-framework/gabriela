const GenericMediator = require('../events/genericMediator');
const pluginExecuteFactory = require('../plugin/executeFactory');
const moduleExecuteFactory = require('../module/executeFactory');
const {runOnAppStarted} = require('../events/util/gabrielaEventUtils');

async function runApp(
    config,
    events,
    rootCompiler,
    pluginInterface,
    moduleInterface,
) {
    await pluginInterface.run(pluginExecuteFactory.bind(null, moduleExecuteFactory, null));
    await moduleInterface.run(moduleExecuteFactory.bind(null, null));

    const context = {
        gabriela: this,
        err: null
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