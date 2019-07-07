const ModuleTree = require('../module/moduleTree');
const callEvent = require('../events/callEvent');

function _assignMediatorEvents(plugin, excludes) {
    if (plugin.hasMediators()) {
        const mediators = plugin.mediator;

        const props = Object.keys(mediators);

        for (const name of props) {
            if (!excludes.includes(name)) {
                plugin.mediatorInstance.add(name, mediators[name]);
            }
        }
    }
}

function factory() {
    function create(plugin) {
        _assignMediatorEvents(plugin, [
            'onPluginStarted',
            'onPluginFinished',
            'onError',
        ]);

        async function run(config) {
            const moduleTree = new ModuleTree(
                config,
                plugin.compiler.root,
                plugin.sharedCompiler,
                plugin.exposedMediator
            );


            if (plugin.modules && plugin.modules.length > 0) {
                try {
                    for (const mdl of plugin.modules) {
                        moduleTree.addModule(mdl, plugin.compiler);
                    }

                    callEvent.call(plugin.mediatorInstance, plugin, 'onPluginStarted');

                    await moduleTree.runTree(config, plugin.compiler);

                    callEvent.call(plugin.mediatorInstance, plugin, 'onPluginFinished');
                } catch (err) {
                    // throw error if it doesnt have any mediators
                    if (!plugin.hasMediators()) throw err;

                    // throw error if it has mediators but it does not have onError
                    if (plugin.hasMediators() && !plugin.mediator.onError) throw err;

                    plugin.mediatorInstance.runOnError(plugin.mediator.onError, err);
                }
            }
        }

        function instance() {
            this.run = run;
        }

        return new instance();
    }

    this.create = create;
}

module.exports = new factory();