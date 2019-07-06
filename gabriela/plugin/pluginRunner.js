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

        async function run() {
            callEvent.call(plugin.mediatorInstance, plugin, 'onPluginStarted');

            if (plugin.hasModules()) {
                try {
                    await plugin.moduleTree.runAll();
                } catch (err) {
                    // throw error if it doesnt have any mediators
                    if (!plugin.hasMediators()) throw err;

                    // throw error if it has mediators but it does not have onError
                    if (plugin.hasMediators() && !plugin.mediator.onError) throw err;

                    plugin.mediatorInstance.runOnError(plugin.mediator.onError, err);
                }
            }

            callEvent.call(plugin.mediatorInstance, plugin, 'onPluginFinished');
        }

        function instance() {
            this.run = run;
        }

        return new instance();
    }

    this.create = create;
}

module.exports = new factory();