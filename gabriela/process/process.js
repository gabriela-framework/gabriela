const GenericMediator = require('../events/genericMediator');
const pluginExecuteFactory = require('../plugin/executeFactory');
const moduleExecuteFactory = require('../module/executeFactory');

async function runApp(
    config,
    events,
    rootCompiler,
    pluginInterface,
    moduleInterface,
) {
    await pluginInterface.run(pluginExecuteFactory.bind(null, moduleExecuteFactory, null));
    await moduleInterface.run(moduleExecuteFactory.bind(null, null));

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