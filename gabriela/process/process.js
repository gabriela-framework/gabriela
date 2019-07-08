const GenericMediator = require('../events/genericMediator');
const pluginExecuteFactory = require('../plugin/processExecuteFactory');

async function runApp(
    config,
    events,
    rootCompiler,
    pluginInterface,
    moduleInterface,
) {
    await pluginInterface.run(pluginExecuteFactory);
    await moduleInterface.run();

    if (events && events.onAppStarted) {
        const mediator = GenericMediator.create(rootCompiler);

        mediator.callEvent(events.onAppStarted);
    }

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
        return runApp(
            config,
            events,
            rootCompiler,
            pluginInterface,
            moduleInterface,
        );
    }

    this.run = run;
}

module.exports = factory;